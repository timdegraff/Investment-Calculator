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
    return 0; // For Cash and Savings
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
            type: 'bar', // Changed to bar for better stacking visualization
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
        const { assumptions, investments, budget } = data;
        const currentAge = parseInt(assumptions.currentAge, 10) || assumptions.defaults.currentAge;
        const yearsToProject = 80 - currentAge;

        const allAssets = [
            ...(investments || []).map(inv => ({ name: inv.name, type: inv.type, currentValue: math.fromCurrency(inv.value), annualContribution: 0 })),
            ...(budget?.savings || []).map(sav => ({ name: sav.name, type: 'Savings', currentValue: 0, annualContribution: math.fromCurrency(sav.contribution) }))
        ];
        
        if (allAssets.length === 0) return { labels: [], datasets: [], tableData: [], assetDetails: [] };

        // --- Aggregate by Type for Chart ---
        const aggregatedAssets = {};
        allAssets.forEach(asset => {
            if (!aggregatedAssets[asset.type]) {
                aggregatedAssets[asset.type] = { currentValue: 0, annualContribution: 0 };
            }
            aggregatedAssets[asset.type].currentValue += asset.currentValue;
            aggregatedAssets[asset.type].annualContribution += asset.annualContribution;
        });

        const chartAssetTypes = Object.keys(aggregatedAssets);
        let chartCurrentValues = chartAssetTypes.map(type => aggregatedAssets[type].currentValue);
        const chartAnnualContributions = chartAssetTypes.map(type => aggregatedAssets[type].annualContribution);

        const datasets = chartAssetTypes.map(type => ({
            label: type,
            data: [],
            backgroundColor: assetClassColors[type] || '#34d399',
            barPercentage: 0.9, // Adjust for spacing
            categoryPercentage: 0.8, // Adjust for spacing
        }));

        // --- Keep Individual Assets for Table ---
        let tableCurrentValues = allAssets.map(a => a.currentValue);
        const tableAnnualContributions = allAssets.map(a => a.annualContribution);
        const assetDetails = allAssets.map(a => ({ name: a.name || 'Unnamed', type: a.type }));

        const labels = [];
        const tableData = [];

        for (let i = 0; i <= yearsToProject; i++) {
            const age = currentAge + i;
            labels.push(age);
            const tableRow = { 'Year': new Date().getFullYear() + i, 'Age': age, 'Total': 0 };

            // --- Update & Record Chart Data ---
            if (i > 0) {
                chartCurrentValues = chartCurrentValues.map((value, index) => {
                    const assetType = chartAssetTypes[index];
                    const growthRate = getGrowthRate(assetType, assumptions);
                    return (value + chartAnnualContributions[index]) * (1 + growthRate);
                });
            }
            chartCurrentValues.forEach((value, index) => datasets[index].data.push(value));
            
            // --- Update & Record Table Data ---
             if (i > 0) {
                tableCurrentValues = tableCurrentValues.map((value, index) => {
                    const assetType = assetDetails[index].type;
                    const growthRate = getGrowthRate(assetType, assumptions);
                    return (value + tableAnnualContributions[index]) * (1 + growthRate);
                });
            }
            let totalRowValue = 0;
            tableCurrentValues.forEach((value, index) => {
                tableRow[assetDetails[index].name] = value;
                totalRowValue += value;
            });
            tableRow.Total = totalRowValue;

            tableData.push(tableRow);
        }
        
        return { labels, datasets, tableData, assetDetails };
    },

    calculateSummaries: (data) => {
        const investmentAssets = data.investments?.reduce((sum, item) => sum + math.fromCurrency(item.value), 0) || 0;
        const realEstateValue = data.realEstate?.reduce((sum, item) => sum + math.fromCurrency(item.value), 0) || 0;
        const otherAssetsValue = data.otherAssets?.reduce((sum, item) => sum + math.fromCurrency(item.value), 0) || 0;
        const totalAssets = investmentAssets + realEstateValue + otherAssetsValue;

        const debtLiabilities = data.debts?.reduce((sum, item) => sum + math.fromCurrency(item.balance), 0) || 0;
        const helocLiabilities = data.helocs?.reduce((sum, item) => sum + math.fromCurrency(item.balance), 0) || 0;
        const mortgageLiability = data.realEstate?.reduce((sum, item) => sum + math.fromCurrency(item.mortgage), 0) || 0;
        const totalLiabilities = debtLiabilities + helocLiabilities + mortgageLiability;

        const grossIncome = data.income?.reduce((sum, item) => {
            const base = math.fromCurrency(item.amount) || 0;
            const bonus = base * (parseFloat(item.bonusPct) / 100 || 0);
            return sum + base + bonus;
        }, 0) || 0;

        const totalAnnualSavings = data.budget?.savings?.reduce((sum, item) => sum + math.fromCurrency(item.contribution), 0) || 0;
        const totalAnnualBudget = data.budget?.expenses?.reduce((sum, item) => sum + math.fromCurrency(item.annual), 0) || 0;

        return {
            netWorth: totalAssets - totalLiabilities,
            totalAssets,
            totalLiabilities,
            grossIncome,
            totalAnnualSavings,
            totalMonthlyBudget: totalAnnualBudget / 12,
            totalAnnualBudget
        };
    }
};