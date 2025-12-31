import { initializeAuth } from './auth.js';

/**
 * CORE.JS - UI Management & Core Application Logic
 * This is the main entry point for the application.
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
    document.getElementById('sum-income').textContent = math.toCurrency(summaries.grossIncome);

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
            const monthlyValue = parseFloat(formatter.stripCommas(monthlyInput.value)) || 0;
            annualInput.value = formatter.addCommas(Math.round(monthlyValue * 12));
        });
        annualInput.addEventListener('input', () => {
            const annualValue = parseFloat(formatter.stripCommas(annualInput.value)) || 0;
            monthlyInput.value = formatter.addCommas(Math.round(annualValue / 12));
        });
    }
}

function fillRow(row, data) {
    Object.keys(data).forEach(key => {
        const input = row.querySelector(`[data-id="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = data[key];
            } else if (input.dataset.type === 'currency') {
                input.value = formatter.addCommas(data[key]);
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

// 4. Budget Sorting
let budgetSortOrder = {
    column: 'monthly',
    ascending: false
};

window.sortBudget = (column) => {
    if (budgetSortOrder.column === column) {
        budgetSortOrder.ascending = !budgetSortOrder.ascending;
    } else {
        budgetSortOrder.column = column;
        budgetSortOrder.ascending = false;
    }

    const rows = Array.from(document.getElementById('budget-rows').querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = parseFloat(formatter.stripCommas(a.querySelector(`[data-id="${column}"]`).value)) || 0;
        const bValue = parseFloat(formatter.stripCommas(b.querySelector(`[data-id="${column}"]`).value)) || 0;

        return budgetSortOrder.ascending ? aValue - bValue : bValue - aValue;
    });

    const tbody = document.getElementById('budget-rows');
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
};


// --- Application Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
    // First, set up the basic UI (e.g., show the default tab)
    showTab('assets-debts');

    // Now, initialize the authentication and data loading process.
    // This ensures the UI is ready before we try to populate it with data.
    initializeAuth();
});
