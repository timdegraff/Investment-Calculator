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
        drawdown: 4,
        drawdownSWR: 3,
        stockAPY: 10,
        retirementAge: 65,
        taxRate: 25
    }
};

export const engine = {
    runProjection: (data) => {
        // Projection logic will go here
        console.log("Running projection with:", data);

        const canvas = document.getElementById('projectionChart');
        if (!canvas) return;

        const projectionData = engine.calculateProjection(data);

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
                        borderColor: '#34d399',
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
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
        const years = 50; // Project 50 years into the future
        const labels = Array.from({length: years}, (_, i) => new Date().getFullYear() + i);
        const netWorthData = [];
        const spendingData = [];

        let currentNetWorth = engine.calculateSummaries(data).netWorth;
        const annualSavings = engine.calculateSummaries(data).totalAnnualSavings;
        const annualSpending = engine.calculateSummaries(data).totalAnnualSpending;

        for (let i = 0; i < years; i++) {
            netWorthData.push(currentNetWorth);
            spendingData.push(annualSpending);
            currentNetWorth = (currentNetWorth + annualSavings) * (1 + (data.assumptions.stockAPY / 100));
        }

        return { labels, netWorth: netWorthData, spending: spendingData };
    },

    calculateSummaries: (data) => {
        const totalAssets = data.investments?.reduce((sum, item) => sum + math.fromCurrency(item.value), 0) || 0;
        const totalLiabilities = data.debts?.reduce((sum, item) => sum + math.fromCurrency(item.balance), 0) || 0;
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