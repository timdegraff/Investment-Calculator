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

        // 1. Correctly initialize asset values
        let portfolio = (data.investments?.reduce((s, i) => s + Number(i.value || 0), 0) || 0) +
                        (data.otherAssets?.reduce((s, o) => s + Number(o.value || 0), 0) || 0);
        let realEstate = data.realEstate?.reduce((s, r) => s + Number(r.value || 0), 0) || 0;
        
        // 2. Get initial income and savings rates from summaries
        const initialSummaries = engine.calculateSummaries(data);
        let currentAnnualGross = initialSummaries.grossIncome;
        const workplaceSavingsRate = currentAnnualGross > 0 ? (initialSummaries.workplaceSavings.personal + initialSummaries.workplaceSavings.match) / currentAnnualGross : 0;
        const manualSavings = data.manualSavings?.reduce((s, item) => s + Number(item.annual || 0), 0) || 0;

        const results = [];
        results.push({ age: startAge, portfolio, realEstate, netWorth: portfolio + realEstate }); // Log initial state

        for (let age = startAge + 1; age <= 100; age++) {
            let annualSavings;
            
            // 3. Calculate savings/drawdown for the year
            if (age <= a.retirementAge) {
                // Pre-retirement: grow income and calculate savings
                currentAnnualGross *= (1 + a.salaryGrowth / 100);
                const workplaceSavings = currentAnnualGross * workplaceSavingsRate;
                annualSavings = workplaceSavings + manualSavings;
            } else {
                // Post-retirement: calculate drawdown and add SS
                const drawRate = age < a.ssStartAge ? a.preSSDraw : a.postSSDraw;
                const drawAmount = portfolio * (drawRate / 100);
                const ssIncome = (age >= a.ssStartAge) ? (a.ssMonthly * 12) : 0;
                annualSavings = ssIncome - drawAmount;
            }
            
            // 4. Apply growth to assets
            portfolio = portfolio * (1 + (a.stockGrowth / 100)) + annualSavings;
            realEstate *= (1 + (a.housingGrowth / 100));
            
            results.push({ 
                age,
                portfolio: Math.max(0, portfolio),
                realEstate: Math.max(0, realEstate),
                netWorth: Math.max(0, portfolio + realEstate)
            });
        }
        engine.displayProjection(results.slice(1), a); // Display from the first projected year
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
                        label: 'Portfolio',
                        data: portfolioData,
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderColor: 'rgba(79, 70, 229, 1)',
                        borderWidth: 2,
                        fill: true,
                        pointRadius: 0,
                        tension: 0.4
                    },
                    {
                        label: 'Real Estate',
                        data: realEstateData,
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        borderColor: 'rgba(22, 163, 74, 1)',
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
            const todaysValue = row.netWorth / Math.pow(inflation, i + 1); // Adjust index for inflation calculation
            tr.className = "border-t border-slate-100";
            tr.innerHTML = `
                <td class="px-6 py-3 font-bold">${row.age}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.portfolio)}</td>
                <td class="px-6 py-3 text-right">${math.toCurrency(row.realEstate)}</td>
                <td class="px-6 py-3 text-right font-black">${math.toCurrency(row.netWorth)}</td>
                <td class="px-6 py-3 text-right text-emerald-600 font-bold">${math.toCurrency(todaysValue)}</td>
            `;
            body.appendChild(tr);
        });
    }
};