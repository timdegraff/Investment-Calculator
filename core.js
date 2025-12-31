import { initializeAuth } from './auth.js';
import { templates } from './templates.js';

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

window.updateCostBasisHeaderVisibility = () => {
    const investmentRows = document.getElementById('investment-rows');
    if (!investmentRows) return;

    const typeSelects = investmentRows.querySelectorAll('[data-id="type"]');
    const hasRoth = Array.from(typeSelects).some(select => select.value === 'Post-Tax (Roth)');

    const costBasisHeader = document.querySelector('th.cost-basis-cell');
    if (costBasisHeader) {
        costBasisHeader.classList.toggle('hidden', !hasRoth);
    }
};

// 2. Dynamic Summary Updates
window.updateSummaries = (data) => {
    if (!data) return;

    const summaries = engine.calculateSummaries(data);

    // Sidebar & Main Summary
    document.getElementById('sidebar-networth').textContent = math.toCurrency(summaries.netWorth, false);
    document.getElementById('sum-assets').textContent = math.toCurrency(summaries.totalAssets, false);
    document.getElementById('sum-liabilities').textContent = math.toCurrency(summaries.totalLiabilities, false);
    document.getElementById('sum-income-summary').textContent = `${math.toCurrency(summaries.grossIncome, false)}/yr`;
    document.getElementById('sum-total-savings-summary').textContent = `${math.toCurrency(summaries.totalAnnualSavings, false)}/yr`;

    // ... (rest of the function is the same)
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
        // ... (range slider logic)
    });

    // Monthly/Annual field synchronization
    // ... (logic is the same)

    // Show/hide cost basis for Roth assets and apply color
    const typeSelect = element.querySelector('[data-id="type"]');
    if (typeSelect) {
        const costBasisCell = element.querySelector('.cost-basis-cell');

        const updateAssetType = () => {
            const selectedValue = typeSelect.value;
            if (costBasisCell) {
                costBasisCell.classList.toggle('hidden', selectedValue !== 'Post-Tax (Roth)');
            }
            typeSelect.style.color = assetClassColors[selectedValue] || '#e2e8f0';
            window.updateCostBasisHeaderVisibility();
        };

        typeSelect.addEventListener('change', updateAssetType);
        updateAssetType(); // Initial call
    }
}

function fillRow(row, data) {
    Object.keys(data).forEach(key => {
        const input = row.querySelector(`[data-id="${key}"]`);
        if (input) {
            // ... (filling logic)
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
}

// ... (rest of the file is the same)

// --- Application Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
    showTab('assets-debts');
    initializeAuth();
});