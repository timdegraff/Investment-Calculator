const assetClassColors = {
    'Taxable': '#3b82f6', // Blue
    'Pre-Tax (401k/IRA)': '#8b5cf6', // Violet
    'Post-Tax (Roth)': '#10b981', // Emerald
    'HSA': '#14b8a6', // Teal
    '529 Plan': '#06b6d4', // Cyan
    'Cash': '#6b7280', // Gray
    'Bitcoin': '#f97316', // Orange
    'Metals': '#facc15', // Yellow/Gold
    'Real Estate': '#ef4444', // Red
};

const engine = {
    chart: null, // To hold the chart instance

    calculateSummaries: (data) => {
        const summaries = {};
        const a = data.assumptions || assumptions.defaults;

        // --- Assets & Liabilities ---
        const totalInvestments = data.investments?.reduce((a, b) => a + Number(b.value || 0), 0) || 0;
        const totalRealEstate = data.realEstate?.reduce((a, b) => a + Number(b.value || 0), 0) || 0;
        const totalOtherAssets = data.otherAssets?.reduce((a, b) => a + Number(b.value || 0), 0) || 0;
        summaries.totalAssets = totalInvestments + totalRealEstate + totalOtherAssets;

        const realEstateDebt = data.realEstate?.reduce((a, b) => a + Number(b.debt || 0), 0) || 0;
        const otherAssetDebt = data.otherAssets?.reduce((a, b) => a + Number(b.debt || 0), 0) || 0;
        const standaloneDebt = data.debts?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0;
        summaries.totalLiabilities = realEstateDebt + otherAssetDebt + standaloneDebt;
        summaries.netWorth = summaries.totalAssets - summaries.totalLiabilities;

        // --- Income & Savings ---
        let currentAnnualGross = 0;
        let totalPersonal401k = 0;
        let totalMatch401k = 0;
        data.income?.forEach(inc => {
            const base = Number(inc.amount) || 0;
            const bonus = base * (Number(inc.bonusPct || 0) / 100);
            const totalComp = base + bonus;
            currentAnnualGross += totalComp;

            const contribBase = inc.contribIncBonus ? totalComp : base;
            const matchBase = inc.matchIncBonus ? totalComp : base;

            totalPersonal401k += contribBase * (Number(inc.contribution || 0) / 100);
            totalMatch401k += matchBase * (Number(inc.match || 0) / 100);
        });

        summaries.grossIncome = currentAnnualGross;
        summaries.workplaceSavings = { personal: totalPersonal401k, match: totalMatch401k };
        const manualSavings = data.manualSavings?.reduce((a, b) => a + Number(b.annual || 0), 0) || 0;
        summaries.totalAnnualSavings = totalPersonal401k + totalMatch401k + manualSavings;
        
        // --- Budget & Cashflow ---
        summaries.totalMonthlyExpenses = data.expenses?.reduce((a, b) => a + Number(b.monthly || 0), 0) || 0;
        summaries.totalAnnualExpenses = summaries.totalMonthlyExpenses * 12;
        const annualTaxableIncome = currentAnnualGross - totalPersonal401k;
        const estimatedAnnualTaxes = math.calculateProgressiveTax(annualTaxableIncome);
        const netAnnualIncome = currentAnnualGross - estimatedAnnualTaxes;
        summaries.estimatedAnnualCashflow = netAnnualIncome - summaries.totalAnnualExpenses - manualSavings;
        summaries.estimatedMonthlyCashflow = summaries.estimatedAnnualCashflow / 12;

        return summaries;
    },

    runProjection: (data) => {
        if (!data || !data.assumptions) return;
        const a = data.assumptions;
        const startAge = new Date().getFullYear() - a.birthYear;

        // 1. Initialize asset buckets
        let taxable = 0;
        let preTax = 0;
        let roth = 0;
        let hsa = 0;
        let plan529 = 0;
        let cash = 0;
        let bitcoin = 0;
        let metals = 0;
        let realEstate = 0;

        data.investments?.forEach(inv => {
            const value = Number(inv.value || 0);
            switch (inv.type) {
                case 'Taxable': taxable += value; break;
                case 'Pre-Tax (401k/IRA)': preTax += value; break;
                case 'Post-Tax (Roth)': roth += value; break;
                case 'HSA': hsa += value; break;
                case '529 Plan': plan529 += value; break;
                case 'Cash': cash += value; break;
                case 'Bitcoin': bitcoin += value; break;
                case 'Metals': metals += value; break;
                default: taxable += value;
            }
        });

        const initialSummaries = engine.calculateSummaries(data);
        let currentAnnualGross = initialSummaries.grossIncome;
        const workplaceSavings = initialSummaries.workplaceSavings.personal + initialSummaries.workplaceSavings.match;

        let manualSavingsTaxable = 0;
        let manualSavingsPreTax = 0;
        let manualSavingsRoth = 0;

        data.manualSavings?.forEach(item => {
            const annual = Number(item.annual || 0);
            if (item.type === 'Post-Tax (Roth)' || item.type === 'HSA') {
                manualSavingsRoth += annual;
            } else if (item.type === 'Pre-Tax (401k/IRA)') {
                manualSavingsPreTax += annual;
            } else { 
                manualSavingsTaxable += annual;
            }
        });

        const leftoverCashflow = initialSummaries.estimatedAnnualCashflow > 0 ? initialSummaries.estimatedAnnualCashflow : 0;

        const results = [];
        results.push({ 
            age: startAge, taxable, preTax, roth, hsa, plan529, cash, bitcoin, metals, realEstate, 
            netWorth: taxable + preTax + roth + hsa + plan529 + cash + bitcoin + metals + realEstate 
        });

        for (let age = startAge + 1; age <= 100; age++) {
            let annualSavingsTaxable = manualSavingsTaxable + leftoverCashflow;
            let annualSavingsPreTax = workplaceSavings + manualSavingsPreTax;
            let annualSavingsRoth = manualSavingsRoth;

            if (age <= a.retirementAge) {
                currentAnnualGross *= (1 + a.salaryGrowth / 100);
                const currentWorkplaceSavings = currentAnnualGross * (workplaceSavings / initialSummaries.grossIncome);
                
                const annualTaxableIncome = currentAnnualGross - (initialSummaries.workplaceSavings.personal);
                const estimatedAnnualTaxes = math.calculateProgressiveTax(annualTaxableIncome);
                const netAnnualIncome = currentAnnualGross - estimatedAnnualTaxes;
                const currentLeftover = netAnnualIncome - initialSummaries.totalAnnualExpenses - (manualSavingsTaxable + manualSavingsPreTax + manualSavingsRoth);
                
                annualSavingsTaxable = manualSavingsTaxable + (currentLeftover > 0 ? currentLeftover : 0);
                annualSavingsPreTax = currentWorkplaceSavings + manualSavingsPreTax;

            } else {
                const totalPortfolio = taxable + preTax + roth + hsa + plan529 + cash + bitcoin + metals;
                const drawRate = age < a.ssStartAge ? a.preSSDraw : a.postSSDraw;
                const drawAmount = totalPortfolio * (drawRate / 100);
                const ssIncome = (age >= a.ssStartAge) ? (a.ssMonthly * 12) : 0;
                const netCashflow = ssIncome - drawAmount;

                if (netCashflow < 0) {
                    const drawFromTaxable = Math.min(taxable, Math.abs(netCashflow));
                    taxable -= drawFromTaxable;
                    const remainingDraw = Math.abs(netCashflow) - drawFromTaxable;
                    preTax -= remainingDraw;
                } else {
                    taxable += netCashflow;
                }
                annualSavingsTaxable = 0;
                annualSavingsPreTax = 0;
                annualSavingsRoth = 0;
            }

            taxable = taxable * (1 + (a.stockGrowth / 100)) + annualSavingsTaxable;
            preTax = preTax * (1 + (a.stockGrowth / 100)) + annualSavingsPreTax;
            roth = roth * (1 + (a.stockGrowth / 100)) + annualSavingsRoth;
            hsa = hsa * (1 + (a.stockGrowth / 100));
            plan529 = plan529 * (1 + (a.stockGrowth / 100));
            cash = cash * (1 + (a.inflation / 100));
            bitcoin = bitcoin * (1 + ((a.cryptoGrowth || a.stockGrowth) / 100));
            metals = metals * (1 + (a.inflation / 100));
            realEstate *= (1 + (a.housingGrowth / 100));
            
            const netWorth = taxable + preTax + roth + hsa + plan529 + cash + bitcoin + metals + realEstate;
            results.push({ 
                age, 
                taxable: Math.max(0, taxable), preTax: Math.max(0, preTax), roth: Math.max(0, roth), hsa: Math.max(0, hsa), 
                plan529: Math.max(0, plan529), cash: Math.max(0, cash), bitcoin: Math.max(0, bitcoin), 
                metals: Math.max(0, metals), realEstate: Math.max(0, realEstate), netWorth: Math.max(0, netWorth)
            });
        }
        engine.displayProjection(results.slice(1), a);
    },

    displayProjection: (results, assumptions) => {
        const ctx = document.getElementById('growthChart')?.getContext('2d');
        if (!ctx) return;

        const labels = results.map(r => r.age);
        const datasets = Object.keys(assetClassColors).map(key => ({
            label: key,
            data: results.map(r => r[key.toLowerCase().replace(/[^a-z0-9]/g, '')]),
            backgroundColor: assetClassColors[key] + '80', // Add alpha for fill
            borderColor: assetClassColors[key],
            fill: true,
            pointRadius: 0,
            tension: 0.4
        }));

        if (engine.chart) {
            engine.chart.destroy();
        }

        engine.chart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', align: 'end' },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: { 
                            label: (context) => `${context.dataset.label}: ${math.toCurrency(context.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Age' },
                        grid: { display: false }
                    },
                    y: {
                        stacked: true,
                        title: { display: true, text: 'Net Worth' },
                        ticks: { callback: (value) => math.toCurrency(value, false, 0) },
                        border: { dash: [4, 4] }
                    }
                }
            }
        });

        const body = document.getElementById('projection-table-body');
        if (!body) return;
        body.innerHTML = '';
        const inflation = 1 + (assumptions.inflation / 100);

        results.forEach((row, i) => {
            const tr = document.createElement('tr');
            const todaysValue = row.netWorth / Math.pow(inflation, i + 1);
            tr.className = "border-t border-slate-700";
            tr.innerHTML = `
                <td class="px-6 py-3 font-bold">${row.age}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.taxable)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.preTax)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.roth)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.hsa)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.plan529)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.cash)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.bitcoin)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.metals)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.realEstate)}</td>
                <td class="px-6 py-3 text-right font-black">${math.toCurrency(row.netWorth)}</td>
                <td class="px-6 py-3 text-right text-green-400 font-bold">${math.toCurrency(todaysValue)}</td>
            `;
            body.appendChild(tr);
        });
    }
};