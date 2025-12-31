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
        let roth = 0;
        let cryptoMetals = 0;

        data.investments?.forEach(inv => {
            const value = Number(inv.value || 0);
            switch (inv.type) {
                case 'taxable':
                case 'brokerage':
                    taxable += value;
                    break;
                case 'roth-ira':
                case '401k':
                case 'hsa':
                    roth += value;
                    break;
                case 'crypto':
                case 'metals':
                    cryptoMetals += value;
                    break;
                default:
                    taxable += value;
            }
        });

        cryptoMetals += data.otherAssets?.reduce((s, o) => s + Number(o.value || 0), 0) || 0;
        let realEstate = data.realEstate?.reduce((s, r) => s + Number(r.value || 0), 0) || 0;
        
        const initialSummaries = engine.calculateSummaries(data);
        let currentAnnualGross = initialSummaries.grossIncome;
        const workplaceSavings = initialSummaries.workplaceSavings.personal + initialSummaries.workplaceSavings.match;

        let manualSavingsTaxable = 0;
        let manualSavingsRoth = 0;
        data.manualSavings?.forEach(item => {
            const annual = Number(item.annual || 0);
            if (item.type === 'roth-ira' || item.type === 'hsa') {
                manualSavingsRoth += annual;
            } else { 
                manualSavingsTaxable += annual;
            }
        });

        const leftoverCashflow = initialSummaries.estimatedAnnualCashflow > 0 ? initialSummaries.estimatedAnnualCashflow : 0;

        const results = [];
        results.push({ 
            age: startAge, 
            taxable, 
            roth, 
            cryptoMetals, 
            realEstate, 
            netWorth: taxable + roth + cryptoMetals + realEstate 
        });

        for (let age = startAge + 1; age <= 100; age++) {
            let annualSavingsTaxable = manualSavingsTaxable + leftoverCashflow;
            let annualSavingsRoth = workplaceSavings + manualSavingsRoth;

            if (age <= a.retirementAge) {
                currentAnnualGross *= (1 + a.salaryGrowth / 100);
                const currentWorkplaceSavings = currentAnnualGross * (workplaceSavings / initialSummaries.grossIncome);
                
                const annualTaxableIncome = currentAnnualGross - (initialSummaries.workplaceSavings.personal);
                const estimatedAnnualTaxes = math.calculateProgressiveTax(annualTaxableIncome);
                const netAnnualIncome = currentAnnualGross - estimatedAnnualTaxes;
                const currentLeftover = netAnnualIncome - initialSummaries.totalAnnualExpenses - (manualSavingsTaxable + manualSavingsRoth);
                
                annualSavingsTaxable = manualSavingsTaxable + (currentLeftover > 0 ? currentLeftover : 0);
                annualSavingsRoth = currentWorkplaceSavings + manualSavingsRoth;
            } else {
                const totalPortfolio = taxable + roth + cryptoMetals;
                const drawRate = age < a.ssStartAge ? a.preSSDraw : a.postSSDraw;
                const drawAmount = totalPortfolio * (drawRate / 100);
                const ssIncome = (age >= a.ssStartAge) ? (a.ssMonthly * 12) : 0;
                const netCashflow = ssIncome - drawAmount;

                if (netCashflow < 0) {
                    const drawFromTaxable = Math.min(taxable, Math.abs(netCashflow));
                    taxable -= drawFromTaxable;
                    const remainingDraw = Math.abs(netCashflow) - drawFromTaxable;
                    roth -= remainingDraw;
                } else {
                    taxable += netCashflow;
                }
                annualSavingsTaxable = 0;
                annualSavingsRoth = 0;
            }

            taxable = taxable * (1 + (a.stockGrowth / 100)) + annualSavingsTaxable;
            roth = roth * (1 + (a.stockGrowth / 100)) + annualSavingsRoth;
            cryptoMetals = cryptoMetals * (1 + ((a.cryptoGrowth || a.stockGrowth) / 100));
            realEstate *= (1 + (a.housingGrowth / 100));
            
            const netWorth = taxable + roth + cryptoMetals + realEstate;
            results.push({ 
                age,
                taxable: Math.max(0, taxable),
                roth: Math.max(0, roth),
                cryptoMetals: Math.max(0, cryptoMetals),
                realEstate: Math.max(0, realEstate),
                netWorth: Math.max(0, netWorth)
            });
        }
        engine.displayProjection(results.slice(1), a);
    },

    displayProjection: (results, assumptions) => {
        const ctx = document.getElementById('growthChart')?.getContext('2d');
        if (!ctx) return;

        const labels = results.map(r => r.age);
        const taxableData = results.map(r => r.taxable);
        const rothData = results.map(r => r.roth);
        const cryptoMetalsData = results.map(r => r.cryptoMetals);
        const realEstateData = results.map(r => r.realEstate);

        if (engine.chart) {
            engine.chart.destroy();
        }

        engine.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Taxable',
                        data: taxableData,
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgba(37, 99, 235, 1)',
                        fill: true,
                        pointRadius: 0,
                        tension: 0.4
                    },
                    {
                        label: 'Roth',
                        data: rothData,
                        backgroundColor: 'rgba(34, 197, 94, 0.5)',
                        borderColor: 'rgba(22, 163, 74, 1)',
                        fill: true,
                        pointRadius: 0,
                        tension: 0.4
                    },
                    {
                        label: 'Crypto/Metals',
                        data: cryptoMetalsData,
                        backgroundColor: 'rgba(251, 191, 36, 0.5)',
                        borderColor: 'rgba(245, 158, 11, 1)',
                        fill: true,
                        pointRadius: 0,
                        tension: 0.4
                    },
                     {
                        label: 'Real Estate',
                        data: realEstateData,
                        backgroundColor: 'rgba(249, 115, 22, 0.5)',
                        borderColor: 'rgba(234, 88, 12, 1)',
                        fill: true,
                        pointRadius: 0,
                        tension: 0.4
                    }
                ]
            },
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
                <td class="px-6 py-3 text-right">${math.toCurrency(row.roth)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.cryptoMetals)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.realEstate)}</td>
                <td class="px-6 py-3 text-right font-black">${math.toCurrency(row.netWorth)}</td>
                <td class="px-6 py-3 text-right text-green-400 font-bold">${math.toCurrency(todaysValue)}</td>
            `;
            body.appendChild(tr);
        });
    }
};