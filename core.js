/**
 * CORE.JS - UI Management & Utility Functions
 * Handles Tab navigation, Dynamic row creation, and Data Exports.
 */

// 1. Tab Navigation logic
window.showTab = (tabId) => {
    // Hide all tab content sections
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show the selected tab content
    const selectedTab = document.getElementById(`tab-${tabId}`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Activate the selected tab button
    const selectedButton = document.getElementById(`btn-${tabId}`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Auto-refresh projection if moving to the projection tab
    if (tabId === 'projection' && window.currentData) {
        engine.runProjection(window.currentData);
    }
};

// 2. Asset Allocation Chart
window.renderAssetAllocationChart = (investmentData) => {
    const ctx = document.getElementById('asset-allocation-chart')?.getContext('2d');
    if (!ctx) return;

    const assetClasses = investmentData.reduce((acc, asset) => {
        const aClass = asset.class || 'Other';
        acc[aClass] = (acc[aClass] || 0) + (parseFloat(asset.value) || 0);
        return acc;
    }, {});

    const labels = Object.keys(assetClasses);
    const data = Object.values(assetClasses);

    const backgroundColors = [
        '#4f46e5', // Indigo
        '#10b981', // Emerald
        '#3b82f6', // Blue
        '#f97316', // Orange
        '#ec4899', // Pink
        '#8b5cf6', // Violet
        '#6b7280', // Gray
    ];

    if (window.assetAllocationChart instanceof Chart) {
        window.assetAllocationChart.destroy();
    }

    window.assetAllocationChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Asset Allocation',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
};


// 3. Dynamic Row Management
window.addRow = (containerId, type, data = null) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isIncome = type === 'income';
    const element = document.createElement(isIncome ? 'div' : 'tr');
    
    if (!isIncome) element.className = "border-t border-slate-100";
    
    element.innerHTML = templates[type]();
    container.appendChild(element);

    if (data) fillRow(element, type, data);
    
    return element;
};

function fillRow(row, type, data) {
    const inputs = row.querySelectorAll('input, select');
    
    if (type === 'income') {
        inputs[0].value = data.name || '';
        inputs[1].value = data.amount || 0;
        inputs[2].value = data.bonusPct || 0;
        inputs[3].value = data.nonTaxYear || 0;
        
        const ranges = row.querySelectorAll('input[type=range]');
        ranges[0].value = data.increase || 0;
        ranges[1].value = data.contribution || 0;
        ranges[2].value = data.match || 0;
        
        ranges.forEach(r => {
            if (r.previousElementSibling && r.previousElementSibling.lastElementChild) {
                r.previousElementSibling.lastElementChild.innerText = r.value + '%';
            }
        });

        const checks = row.querySelectorAll('input[type=checkbox]');
        if (checks[0]) checks[0].checked = data.contribIncBonus;
        if (checks[1]) checks[1].checked = data.matchIncBonus;
        
    } else {
        const values = Object.values(data);
        inputs.forEach((input, i) => {
            if (values[i] !== undefined) {
                if (input.type === 'checkbox') input.checked = values[i];
                else input.value = values[i];
            }
        });
    }
}

// 4. Global Utilities
window.exportCSV = () => {
    const rows = Array.from(document.querySelectorAll('#projection-table-body tr'));
    const headerEl = document.querySelectorAll('#projection-header th');
    const headers = Array.from(headerEl).map(th => th.innerText).join(",");
    
    let csv = "data:text/csv;charset=utf-8," + headers + "\n";
    
    rows.forEach(tr => {
        csv += Array.from(tr.cells)
            .map(td => td.innerText.replace(/[\$,]/g, ''))
            .join(",") + "\n";
    });

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `Wealth_Projection_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};