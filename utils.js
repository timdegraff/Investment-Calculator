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
        investmentGrowth: 7,
    }
};

export const engine = {
    runProjection: (data) => {
        const canvas = document.getElementById('projectionChart');
        if (!canvas) return;

        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }

        const { labels, datasets, tableData, assetNames } = engine.calculateAssetProjection(data);

        const tableHeader = document.getElementById('projection-table-header');
        const tableBody = document.getElementById('projection-table-body');
        if (tableHeader && tableBody) {
            tableHeader.innerHTML = '';
            tableBody.innerHTML = '';

            if (assetNames.length > 0) {
                let headerHtml = `<th class="px-4 py-2">Year</th><th class="px-4 py-2">Age</th>`;
                assetNames.forEach(name => {
                    headerHtml += `<th class="px-4 py-2 text-right">${name}</th>`;
                });
                tableHeader.innerHTML = `<tr>${headerHtml}</tr>`;

                let bodyHtml = '';
                tableData.forEach(row => {
                    bodyHtml += `<tr class="table-row">`;
                    bodyHtml += `<td class="px-4 py-2 font-bold">${row.Year}</td>`;
                    bodyHtml += `<td class="px-4 py-2 font-bold">${row.Age}</td>`;
                    assetNames.forEach(name => {
                        bodyHtml += `<td class="px-4 py-2 text-right">${math.toCurrency(row[name])}</td>`;
                    });
                    bodyHtml += `</tr>`;
                });
                tableBody.innerHTML = bodyHtml;
            }
        }

        const ctx = canvas.getContext('2d');
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Age', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                    y: { stacked: true, title: { display: true, text: 'Projected Value', color: '#94a3b8' }, ticks: { color: '#94a3b8', callback: value => math.toCurrency(value, true) }, grid: { color: '#334155' } },
                },
                plugins: {
                    tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${math.toCurrency(ctx.parsed.y)}` } },
                    legend: { labels: { color: '#94a3b8' } }
                },
                interaction: { mode: 'index', intersect: false },
            }
        });
    },

    calculateAssetProjection: (data) => {
        const { assumptions, investments, budget } = data;
        const savings = budget?.savings || [];
        const currentAge = parseInt(assumptions.currentAge, 10);
        const investmentGrowth = parseFloat(assumptions.investmentGrowth) / 100;
        const yearsToProject = 80 - currentAge;

        const allAssets = [
            ...(investments || []).map(inv => ({ name: inv.name, type: inv.type, currentValue: math.fromCurrency(inv.value), annualContribution: 0 })),
            ...savings.map(sav => ({ name: sav.name, type: 'Savings', currentValue: 0, annualContribution: math.fromCurrency(sav.contribution) }))
        ];

        if (allAssets.length === 0) return { labels: [], datasets: [], tableData: [], assetNames: [] };

        const assetNames = allAssets.map(a => a.name || 'Unnamed');
        let currentValues = allAssets.map(a => a.currentValue);
        const annualContributions = allAssets.map(a => a.annualContribution);

        const datasets = allAssets.map(asset => ({
            label: asset.name || 'Unnamed',
            data: [],
            backgroundColor: assetClassColors[asset.type] || '#34d399',
            fill: true, borderColor: '#1e293b', borderWidth: 1,
        }));

        const labels = [];
        const tableData = [];

        for (let i = 0; i <= yearsToProject; i++) {
            const age = currentAge + i;
            labels.push(age);
            const tableRow = { 'Year': new Date().getFullYear() + i, 'Age': age };

            if (i > 0) {
                currentValues = currentValues.map((value, index) => (value + annualContributions[index]) * (1 + investmentGrowth));
            }

            currentValues.forEach((value, index) => {
                datasets[index].data.push(value);
                tableRow[assetNames[index]] = value;
            });

            tableData.push(tableRow);
        }

        return { labels, datasets, tableData, assetNames };
    },

    calculateSummaries: (data) => {
        const investmentAssets = data.investments?.reduce((sum, item) => sum + math.fromCurrency(item.value), 0) || 0;
        const realEstateValue = math.fromCurrency(data.realEstate?.value) || 0;
        const totalAssets = investmentAssets + realEstateValue;

        const debtLiabilities = data.debts?.reduce((sum, item) => sum + math.fromCurrency(item.balance), 0) || 0;
        const helocLiabilities = data.helocs?.reduce((sum, item) => sum + math.fromCurrency(item.balance), 0) || 0;
        const mortgageLiability = math.fromCurrency(data.realEstate?.mortgage) || 0;
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