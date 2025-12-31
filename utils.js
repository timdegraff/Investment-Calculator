export const math = {
    toCurrency: (value, isCompact = false) => {
        if (isNaN(value)) return '$0';
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            notation: isCompact ? 'compact' : 'standard',
            minimumFractionDigits: 0,
            maximumFractionDigits: isCompact ? 1 : 0
        }).format(value);
    },
    fromCurrency: (value) => {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        return Number(String(value).replace(/[^0-9.-]+/g, "")) || 0;
    }
};

export const assetClassColors = {
    'Taxable': '#60a5fa', // blue-400
    'Pre-Tax (401k/IRA)': '#a78bfa', // violet-400
    'Post-Tax (Roth)': '#f87171', // red-400
    'HSA': '#4ade80', // green-400
    '529 Plan': '#fbbf24', // amber-400
    'Cash': '#2dd4bf', // teal-400
    'Crypto': '#f97316', // orange-500
    'Metals': '#eab308', // yellow-500
    'Savings': '#34d399', // emerald-400 - for consistency
};

export const assumptions = {
    defaults: {
        currentAge: 40,
        retirementAge: 65,
        ssStartAge: 67,
        ssMonthly: 2500,
        stockGrowth: 7,
        cryptoGrowth: 10,
        metalsGrowth: 2,
    }
};

const getGrowthRate = (assetType, assumptions) => {
    const stockTypes = ['Taxable', 'Pre-Tax (401k/IRA)', 'Post-Tax (Roth)', 'HSA', '529 Plan'];
    if (stockTypes.includes(assetType)) return parseFloat(assumptions.stockGrowth) / 100;
    if (assetType === 'Crypto') return parseFloat(assumptions.cryptoGrowth) / 100;
    if (assetType === 'Metals') return parseFloat(assumptions.metalsGrowth) / 100;
    return 0.02; // For Cash and Savings
};

export const engine = {
    runProjection: (data) => {
        const canvas = document.getElementById('projectionChart');
        if (!canvas) return;

        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }

        const { labels, datasets, tableData, assetDetails } = engine.calculateAssetProjection(data);

        const tableHeader = document.getElementById('projection-table-header');
        const tableBody = document.getElementById('projection-table-body');
        if (tableHeader && tableBody) {
            tableHeader.innerHTML = '';
            tableBody.innerHTML = '';

            if (assetDetails.length > 0) {
                let headerHtml = `<th class="px-4 py-2">Year</th><th class="px-4 py-2">Age</th><th class="px-4 py-2 text-right">Total</th>`;
                assetDetails.forEach(asset => {
                    const color = assetClassColors[asset.type] || '#94a3b8';
                    headerHtml += `<th class="px-4 py-2 text-right text-white" style="background-color: ${color};">${asset.name}</th>`;
                });
                tableHeader.innerHTML = `<tr>${headerHtml}</tr>`;

                let bodyHtml = '';
                tableData.forEach(row => {
                    bodyHtml += `<tr class="table-row">`;
                    bodyHtml += `<td class="px-4 py-2 font-bold">${row.Year}</td>`;
                    bodyHtml += `<td class="px-4 py-2 font-bold">${row.Age}</td>`;
                    bodyHtml += `<td class="px-4 py-2 font-bold text-right">${math.toCurrency(row.Total)}</td>`;
                    assetDetails.forEach(asset => {
                        bodyHtml += `<td class="px-4 py-2 text-right">${math.toCurrency(row[asset.name])}</td>`;
                    });
                    bodyHtml += `</tr>`;
                });
                tableBody.innerHTML = bodyHtml;
            }
        }

        const ctx = canvas.getContext('2d');
        window.myChart = new Chart(ctx, {
            type: 'bar', 
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true, title: { display: true, text: 'Age', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                    y: { stacked: true, title: { display: true, text: 'Projected Value', color: '#94a3b8' }, ticks: { color: '#94a3b8', callback: value => math.toCurrency(value, true) }, grid: { color: '#334155' } },
                },
                plugins: {
                    tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${math.toCurrency(ctx.raw)}` } },
                    legend: { labels: { color: '#94a3b8' } }
                },
                interaction: { mode: 'index', intersect: false },
            }
        });
    },

    calculateAssetProjection: (data) => {
        const { assumptions, investments, budget, income } = data;
        const { totalAnnualBudget } = engine.calculateSummaries(data);
        
        const currentAge = parseInt(assumptions.currentAge, 10) || assumptions.defaults.currentAge;
        const retirementAge = parseInt(assumptions.retirementAge, 10) || assumptions.defaults.retirementAge;
        const ssStartAge = parseInt(assumptions.ssStartAge, 10) || assumptions.defaults.ssStartAge;
        const ssAnnual = (parseInt(assumptions.ssMonthly, 10) || 0) * 12;
        const yearsToProject = 80 - currentAge;

        const allAssets = [
            ...(investments || []).map(inv => ({ ...inv, currentValue: math.fromCurrency(inv.value) })),
        ];

        // Find or create a 'Cash' account to deposit savings into
        let cashAccount = allAssets.find(a => a.type === 'Cash');
        if (!cashAccount) {
            cashAccount = { name: 'Cash', type: 'Cash', currentValue: 0 };
            allAssets.push(cashAccount);
        }

        if (allAssets.length === 0) return { labels: [], datasets: [], tableData: [], assetDetails: [] };

        const assetDetails = allAssets.map(a => ({ name: a.name || 'Unnamed', type: a.type }));
        let currentValues = allAssets.map(a => a.currentValue);

        const datasets = assetDetails.map(asset => ({
            label: asset.name,
            data: [],
            backgroundColor: assetClassColors[asset.type] || '#34d399',
        }));

        const labels = [];
        const tableData = [];

        for (let i = 0; i <= yearsToProject; i++) {
            const age = currentAge + i;
            labels.push(age);

            // --- Calculate Total Annual Income & Savings ---
            const isRetired = age >= retirementAge;
            let totalAnnualIncome = 0;
            let total401kContribution = 0;

            if (!isRetired) {
                (income || []).forEach(inc => {
                    const base = math.fromCurrency(inc.amount);
                    const bonus = base * (parseFloat(inc.bonusPct) / 100 || 0);
                    let currentYearIncome = base;
                    // Apply raises only up to retirement
                    if (age > currentAge) {
                       currentYearIncome *= Math.pow(1 + (parseFloat(inc.increase) / 100 || 0), i);
                    }
                    totalAnnualIncome += currentYearIncome + bonus;

                    if (!inc.remainsInRetirement) {
                        const personalContrib = (inc.contribIncBonus ? currentYearIncome + bonus : currentYearIncome) * (parseFloat(inc.contribution) / 100 || 0);
                        const companyMatch = (inc.contribIncBonus ? currentYearIncome + bonus : currentYearIncome) * (parseFloat(inc.match) / 100 || 0);
                        total401kContribution += personalContrib + companyMatch;
                    }
                });
            }

            const ssIncome = age >= ssStartAge ? ssAnnual : 0;
            const annualSavings = (budget?.savings?.reduce((sum, s) => sum + math.fromCurrency(s.annual), 0) || 0) + total401kContribution;

            // --- Grow assets ---
            if (i > 0) {
                currentValues = currentValues.map((value, index) => {
                    const assetType = assetDetails[index].type;
                    const growthRate = getGrowthRate(assetType, assumptions);
                    return value * (1 + growthRate);
                });
            }
            
            // Distribute savings to cash/401k
            const preTax401k = allAssets.find(a => a.type === 'Pre-Tax (401k/IRA)');
            if (preTax401k) {
                const idx = assetDetails.findIndex(a => a.name === preTax401k.name);
                if (idx !== -1) currentValues[idx] += total401kContribution;
            }

            const cashIdx = assetDetails.findIndex(a => a.type === 'Cash');
            if (cashIdx !== -1) {
                 currentValues[cashIdx] += (budget?.savings?.reduce((sum, s) => sum + math.fromCurrency(s.annual), 0) || 0);
                 currentValues[cashIdx] += ssIncome;
            }

            // --- Handle Retirement Spending ---
            if (isRetired) {
                let remainingExpenses = totalAnnualBudget;
                const withdrawalOrder = ['Cash', 'Taxable', 'Post-Tax (Roth)', 'Pre-Tax (401k/IRA)'];
                
                for (const type of withdrawalOrder) {
                    const accountsOfType = assetDetails.map((detail, idx) => ({...detail, idx})).filter(d => d.type === type);
                    for (const acc of accountsOfType) {
                        if (remainingExpenses <= 0) break;
                        const available = currentValues[acc.idx];
                        const withdraw = Math.min(remainingExpenses, available);
                        currentValues[acc.idx] -= withdraw;
                        remainingExpenses -= withdraw;
                    }
                }
            }

            // Record data for chart and table
            const totalRowValue = currentValues.reduce((sum, v) => sum + v, 0);
            const tableRow = { 'Year': new Date().getFullYear() + i, 'Age': age, 'Total': totalRowValue };
            
            const aggregatedForChart = {};
            currentValues.forEach((value, index) => {
                const assetType = assetDetails[index].type;
                if(!aggregatedForChart[assetType]) aggregatedForChart[assetType] = 0;
                aggregatedForChart[assetType] += value;
                tableRow[assetDetails[index].name] = value;
            });

            datasets.forEach(ds => {
                const assetType = allAssets.find(a => a.name === ds.label).type;
                const totalForType = Object.entries(aggregatedForChart).reduce((sum, [type, value]) => (type === assetType ? sum + value : sum), 0);
                const individualValue = currentValues[assetDetails.findIndex(a => a.name === ds.label)];
                ds.data.push(individualValue);
            });
            
            tableData.push(tableRow);
        }
        
        const finalDataSets = assetDetails.map(asset => {
             const dsIndex = datasets.findIndex(d => d.label === asset.name);
             return datasets[dsIndex];
        });
        
        return { labels, datasets: finalDataSets, tableData, assetDetails };
    },

    calculateSummaries: (data) => {
        const investmentAssets = data.investments?.reduce((sum, item) => sum + math.fromCurrency(item.value), 0) || 0;
        const realEstateValue = data.realEstate?.reduce((sum, item) => sum + math.fromCurrency(item.value), 0) || 0;
        const otherAssetsValue = data.otherAssets?.reduce((sum, item) => sum + math.fromCurrency(item.value), 0) || 0;
        const totalAssets = investmentAssets + realEstateValue + otherAssetsValue;

        const debtLiabilities = data.debts?.reduce((sum, item) => sum + math.fromCurrency(item.balance), 0) || 0;
        const helocLiabilities = data.helocs?.reduce((sum, item) => sum + math.fromCurrency(item.balance), 0) || 0;
        const mortgageLiability = data.realEstate?.reduce((sum, item) => sum + math.fromCurrency(item.mortgage), 0) || 0;
        const otherAssetLoans = data.otherAssets?.reduce((sum, item) => sum + math.fromCurrency(item.loan), 0) || 0;
        const totalLiabilities = debtLiabilities + helocLiabilities + mortgageLiability + otherAssetLoans;

        const grossIncome = data.income?.reduce((sum, item) => {
            const base = math.fromCurrency(item.amount) || 0;
            const bonus = base * (parseFloat(item.bonusPct) / 100 || 0);
            return sum + base + bonus;
        }, 0) || 0;

        const total401kContribution = data.income?.reduce((sum, item) => {
            const base = math.fromCurrency(item.amount) || 0;
            const bonus = base * (parseFloat(item.bonusPct) / 100 || 0);
            const personalContrib = (item.contribIncBonus ? base + bonus : base) * (parseFloat(item.contribution) / 100 || 0);
            const companyMatch = (item.matchIncBonus ? base + bonus : base) * (parseFloat(item.match) / 100 || 0);
            return sum + personalContrib + companyMatch;
        }, 0) || 0;

        const totalAnnualSavings = (data.budget?.savings?.reduce((sum, item) => sum + math.fromCurrency(item.annual), 0) || 0) + total401kContribution;
        const totalAnnualBudget = data.budget?.expenses?.reduce((sum, item) => sum + math.fromCurrency(item.annual), 0) || 0;

        return {
            netWorth: totalAssets - totalLiabilities,
            totalAssets,
            totalLiabilities,
            grossIncome,
            total401kContribution,
            totalAnnualSavings,
            totalMonthlyBudget: totalAnnualBudget / 12,
            totalAnnualBudget
        };
    }
};