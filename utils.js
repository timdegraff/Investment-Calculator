export const math = {
    toCurrency: (value, isCompact = false) => {
        if (isNaN(value)) return '$0';
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            notation: isCompact ? 'compact' : 'standard',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },
    fromCurrency: (value) => {
        if (typeof value === 'number') return value;
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
    'Bitcoin': '#f97316', // orange-500
    'Metals': '#eab308' // yellow-500
};

export const assumptions = {
    defaults: {
        currentAge: 40,
        retirementAge: 65,
        investmentGrowth: 8,
        swr: 4,
        taxRate: 20
    }
};

export const engine = {
    runProjection: (data) => {
        console.log("Running projection with:", data);

        const canvas = document.getElementById('projectionChart');
        if (!canvas) return;

        const projectionData = engine.calculateProjection(data);
        const retirementIndex = parseInt(data.assumptions.retirementAge, 10) - parseInt(data.assumptions.currentAge, 10);

        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: projectionData.labels,
                datasets: [
                    {
                        label: 'Net Worth',
                        data: projectionData.netWorth,
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
                        segment: {
                            borderColor: ctx => (ctx.p1.parsed.x >= retirementIndex ? 'rgba(251, 113, 133, 1)' : 'rgba(52, 211, 153, 1)'),
                            borderDash: ctx => (ctx.p1.parsed.x >= retirementIndex ? [5, 5] : undefined),
                        }
                    },
                    {
                        label: 'Annual Spending',
                        data: projectionData.spending,
                        borderColor: '#fb7185',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1',
                    }
            ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Age'
                        }
                    },
                    y: { 
                        type: 'linear', 
                        display: true, 
                        position: 'left',
                        ticks: {
                            callback: value => math.toCurrency(value, true)
                        }
                    },
                    y1: { 
                        type: 'linear', 
                        display: true, 
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: {
                            callback: value => math.toCurrency(value, true)
                        }
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                label += math.toCurrency(context.parsed.y);
                                return label;
                            }
                        }
                    }
                }
            }
        });
    },

    calculateProjection: (data) => {
        const yearsToProject = 60;
        const labels = [];
        const netWorthData = [];
        const spendingData = [];

        const { assumptions } = data;
        const currentAge = parseInt(assumptions.currentAge, 10);
        const retirementAge = parseInt(assumptions.retirementAge, 10);
        const investmentGrowth = parseFloat(assumptions.investmentGrowth) / 100;
        const swr = parseFloat(assumptions.swr) / 100;

        let currentNetWorth = engine.calculateSummaries(data).netWorth;
        const annualSavings = engine.calculateSummaries(data).totalAnnualSavings;
        const annualSpending = engine.calculateSummaries(data).totalAnnualSpending;

        for (let i = 0; i < yearsToProject; i++) {
            const age = currentAge + i;
            labels.push(age);

            if (age < retirementAge) {
                // Pre-retirement: accumulating
                spendingData.push(annualSpending);
                currentNetWorth = (currentNetWorth + annualSavings) * (1 + investmentGrowth);
            } else {
                // Post-retirement: drawing down
                const withdrawal = currentNetWorth * swr;
                spendingData.push(withdrawal);
                currentNetWorth = currentNetWorth * (1 + investmentGrowth) - withdrawal;
            }
            netWorthData.push(currentNetWorth);
        }

        return { labels, netWorth: netWorthData, spending: spendingData };
    },

    calculateSummaries: (data) => {
        const investmentAssets = data.investments?.reduce((sum, item) => sum + math.fromCurrency(item.value), 0) || 0;
        const realEstateValue = math.fromCurrency(data.realEstate?.value) || 0;
        const totalAssets = investmentAssets + realEstateValue;

        const debtLiabilities = data.debts?.reduce((sum, item) => sum + math.fromCurrency(item.balance), 0) || 0;
        const helocLiabilities = data.helocs?.reduce((sum, item) => sum + math.fromCurrency(item.balance), 0) || 0;
        const mortgageLiability = math.fromCurrency(data.realEstate?.mortgage) || 0;
        const totalLiabilities = debtLiabilities + helocLiabilities + mortgageLiability;

        const grossIncome = data.income?.reduce((sum, item) => sum + math.fromCurrency(item.amount), 0) || 0;
        const totalAnnualSavings = data.savings?.reduce((sum, item) => sum + math.fromCurrency(item.contribution), 0) || 0;
        const totalAnnualSpending = data.budget?.reduce((sum, item) => sum + math.fromCurrency(item.annual), 0) || 0;
        
        return {
            netWorth: totalAssets - totalLiabilities,
            totalAssets,
            totalLiabilities,
            grossIncome,
            totalAnnualSavings,
            totalAnnualSpending
        };
    }
};