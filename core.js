/**
 * CORE.JS - UI Management & Core Application Logic
 * Handles Tab navigation, UI updates, and acts as a controller between other modules.
 */

// 1. Tab Navigation
window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    document.getElementById(`btn-${tabId}`).classList.add('active');

    // Refresh projection if switching to that tab
    if (tabId === 'projection' && window.currentData) {
        engine.runProjection(window.currentData);
    }
};

// 2. Dynamic Summary Updates
window.updateSummaries = (data) => {
    if (!data) return;

    const summaries = engine.calculateSummaries(data);

    // Sidebar and Assets/Debts Tab
    document.getElementById('sidebar-networth').textContent = formatCurrency(summaries.netWorth);
    document.getElementById('sum-assets').textContent = formatCurrency(summaries.totalAssets);
    document.getElementById('sum-liabilities').textContent = formatCurrency(summaries.totalLiabilities);

    // Income Tab
    document.getElementById('sum-income').textContent = formatCurrency(summaries.grossIncome2026);

    // Savings Tab
    document.getElementById('sum-total-savings').textContent = formatCurrency(summaries.totalAnnualSavings, 0);
    document.getElementById('val-401k-personal').textContent = formatCurrency(summaries.workplaceSavings.personal, 0);
    document.getElementById('val-401k-match').textContent = formatCurrency(summaries.workplaceSavings.match, 0);

    // Budget Tab
    document.getElementById('budget-sum-monthly').textContent = formatCurrency(summaries.totalMonthlyExpenses, 0);
    document.getElementById('budget-cashflow').textContent = formatCurrency(summaries.estimatedMonthlyCashflow, 0);
    
    // Run projection automatically
    engine.runProjection(data);
};

// 3. Dynamic Row Management
window.addRow = (containerId, type, data = null) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isCard = type === 'income';
    const element = document.createElement(isCard ? 'div' : 'tr');
    
    element.innerHTML = templates[type]();
    container.appendChild(element);

    // Attach event listeners for dynamic inputs
    element.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', window.autoSave);
    });

    // Special handling for range sliders to update their display value
    element.querySelectorAll('input[type="range"]').forEach(slider => {
        const display = slider.previousElementSibling?.querySelector('span');
        if(display) {
            slider.addEventListener('input', () => display.textContent = slider.value + '%');
        }
    });

    if (data) fillRow(element, data);
    
    return element;
};

function fillRow(row, data) {
    Object.keys(data).forEach(key => {
        const input = row.querySelector(`[data-id="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = data[key];
            } else {
                input.value = data[key];
            }
            // Also trigger display update for range sliders when filling rows
            if (input.type === 'range') {
                const display = input.previousElementSibling?.querySelector('span');
                if (display) display.textContent = input.value + '%';
            }
        }
    });
}

// 4. Utility
function formatCurrency(value, fractionDigits = 2) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value || 0);
}

// Initial setup on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Set the initial active tab
    showTab('assets-debts');
});