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

    if (tabId === 'projection' && window.currentData) {
        engine.runProjection(window.currentData);
    }
};

// 2. Dynamic Summary Updates
window.updateSummaries = (data) => {
    if (!data) return;

    const summaries = engine.calculateSummaries(data);

    // Sidebar & Assets Tab
    document.getElementById('sidebar-networth').textContent = math.toCurrency(summaries.netWorth);
    document.getElementById('sum-assets').textContent = math.toCurrency(summaries.totalAssets);
    document.getElementById('sum-liabilities').textContent = math.toCurrency(summaries.totalLiabilities);

    // Income Tab
    document.getElementById('sum-income').textContent = math.toCurrency(summaries.grossIncome2026);

    // Savings Tab
    document.getElementById('sum-total-savings').textContent = math.toCurrency(summaries.totalAnnualSavings);
    document.getElementById('val-401k-personal').textContent = math.toCurrency(summaries.workplaceSavings.personal);
    document.getElementById('val-401k-match').textContent = math.toCurrency(summaries.workplaceSavings.match);

    // Budget Tab
    document.getElementById('budget-sum-monthly').textContent = math.toCurrency(summaries.totalMonthlyExpenses);
    document.getElementById('budget-sum-annual').textContent = `${math.toCurrency(summaries.totalAnnualExpenses)} / year`;
    document.getElementById('budget-cashflow-monthly').textContent = math.toCurrency(summaries.estimatedMonthlyCashflow, true);
    document.getElementById('budget-cashflow-annual').textContent = `${math.toCurrency(summaries.estimatedAnnualCashflow, true)} / year`;

    engine.runProjection(data);
};

// 3. Dynamic Row & Input Management
window.addRow = (containerId, type, data = null) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isCard = type === 'income';
    const element = document.createElement(isCard ? 'div' : 'tr');
    
    element.innerHTML = templates[type]();
    container.appendChild(element);

    attachInputListeners(element);

    if (data) fillRow(element, data);
    
    return element;
};

function attachInputListeners(element) {
    element.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', window.autoSave);
    });

    element.querySelectorAll('input[type="range"]').forEach(slider => {
        const display = slider.previousElementSibling?.querySelector('span');
        if(display) {
            slider.addEventListener('input', () => display.textContent = slider.value + '%');
        }
    });

    // Monthly/Annual field synchronization
    const monthlyInput = element.querySelector('[data-id="monthly"]');
    const annualInput = element.querySelector('[data-id="annual"]');

    if (monthlyInput && annualInput) {
        monthlyInput.addEventListener('input', () => {
            const monthlyValue = parseFloat(monthlyInput.value) || 0;
            annualInput.value = Math.round(monthlyValue * 12);
        });
        annualInput.addEventListener('input', () => {
            const annualValue = parseFloat(annualInput.value) || 0;
            monthlyInput.value = Math.round(annualValue / 12);
        });
    }
}

function fillRow(row, data) {
    Object.keys(data).forEach(key => {
        const input = row.querySelector(`[data-id="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = data[key];
            } else {
                input.value = data[key];
            }
            if (input.type === 'range') {
                const display = input.previousElementSibling?.querySelector('span');
                if (display) display.textContent = input.value + '%';
            }
        }
    });
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    showTab('assets-debts');
});