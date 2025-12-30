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
        const salaryGrowth = 1 + (a.salaryGrowth / 100);

        data.income?.forEach(inc => {
            const base = Number(inc.amount) || 0;
            currentAnnualGross += base;

            totalPersonal401k += base * (Number(inc.contribution) / 100);
            totalMatch401k += base * (Number(inc.match) / 100);
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

        const summaries = engine.calculateSummaries(data);
        let portfolio = summaries.totalAssets - summaries.totalLiabilities - (data.realEstate?.reduce((s, h) => s + h.value, 0) || 0);
        let realEstate = data.realEstate?.reduce((s, h) => s + h.value, 0) || 0;

        const results = [];
        let currentGross = summaries.grossIncome;

        for (let age = startAge; age <= 100; age++) {
            let annualSavings = 0;
            let portfolioGrowth = 1 + (a.stockGrowth / 100);

            if (age < a.retirementAge) {
                annualSavings = summaries.totalAnnualSavings;
                currentGross *= (1 + a.salaryGrowth / 100);
            } else {
                const drawRate = age < a.ssStartAge ? a.preSSDraw : a.postSSDraw;
                const drawAmount = portfolio * (drawRate / 100);
                annualSavings = -drawAmount;
                if (age >= a.ssStartAge) {
                    annualSavings += a.ssMonthly * 12;
                }
            }
            
            portfolio = portfolio * portfolioGrowth + annualSavings;
            realEstate *= (1 + a.housingGrowth / 100);
            
            results.push({ 
                age,
                portfolio: Math.max(0, portfolio),
                realEstate: Math.max(0, realEstate),
                netWorth: Math.max(0, portfolio + realEstate)
            });
        }
        engine.displayProjection(results, a);
    },

    displayProjection: (results, assumptions) => {
        const ctx = document.getElementById('growthChart')?.getContext('2d');
        if (!ctx) return;

        const labels = results.map(r => r.age);
        const portfolioData = results.map(r => r.portfolio);
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
                        label: 'Real Estate',
                        data: realEstateData,
                        backgroundColor: 'rgba(34, 197, 94, 0.2)', // Emerald-200
                        borderColor: 'rgba(22, 163, 74, 1)',    // Emerald-600
                        borderWidth: 2,
                        fill: true,
                        pointRadius: 0,
                        tension: 0.4
                    },
                    {
                        label: 'Portfolio',
                        data: portfolioData,
                        backgroundColor: 'rgba(99, 102, 241, 0.2)', // Indigo-200
                        borderColor: 'rgba(79, 70, 229, 1)',   // Indigo-600
                        borderWidth: 2,
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

        // Also update the table view
        const body = document.getElementById('projection-table-body');
        if (!body) return;
        body.innerHTML = '';
        const inflation = 1 + (assumptions.inflation / 100);

        results.forEach((row, i) => {
            const tr = document.createElement('tr');
            const todaysValue = row.netWorth / Math.pow(inflation, i);
            tr.className = "border-t border-slate-100";
            tr.innerHTML = `
                <td class="px-6 py-3 font-bold">${row.age}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.portfolio)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.realEstate)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(0)}</td>
                <td class="px-6 py-3 text-right text-red-500">${math.toCurrency(0)}</td>
                <td class="px-6 py-3 text-right font-black">${math.toCurrency(row.netWorth)}</td>
                <td class="px-6 py-3 text-right text-emerald-600 font-bold">${math.toCurrency(todaysValue)}</td>
            `;
            body.appendChild(tr);
        });
    }
};