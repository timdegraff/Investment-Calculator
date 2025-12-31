
import { loginWithGoogle, logoutUser } from './auth.js';
import { templates } from './templates.js';
import { autoSave, updateSummaries } from './data.js';
import { engine, math, assetClassColors } from './utils.js';

// This single function is exported to main.js to initialize the entire UI.
export function initializeUI() {
    console.log("Initializing UI and event listeners...");

    // Set initial tab
    showTab('assets-debts');

    // Attach all event listeners
    attachGlobalListeners();
    attachNavigationListeners();
    attachDynamicRowListeners();
    
    console.log("UI Initialized.");
}

// --- EVENT LISTENER SETUP ---

function attachGlobalListeners() {
    document.getElementById('login-btn').addEventListener('click', loginWithGoogle);
    document.getElementById('logout-btn').addEventListener('click', logoutUser);
}

function attachNavigationListeners() {
    document.getElementById('main-nav').addEventListener('click', (e) => {
        const tabButton = e.target.closest('.tab-btn');
        if (tabButton && tabButton.dataset.tab) {
            showTab(tabButton.dataset.tab);
        }
    });
}

function attachDynamicRowListeners() {
    // This handles clicks for dynamically added rows (e.g., "Add Asset", "Remove Item")
    document.body.addEventListener('click', (e) => {
        const addButton = e.target.closest('[data-add-row]');
        const removeButton = e.target.closest('[data-action="remove"]');

        if (addButton) {
            const containerId = addButton.dataset.addRow;
            const type = addButton.dataset.rowType;
            if (containerId && type) {
                addRow(containerId, type);
            }
        } else if (removeButton) {
            const row = removeButton.closest('tr, .income-card');
            if (row) {
                row.remove();
                autoSave();
                updateCostBasisHeaderVisibility(); 
            }
        }
    });
}

// --- UI MANIPULATION FUNCTIONS ---

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const tabElement = document.getElementById(`tab-${tabId}`);
    const btnElement = document.querySelector(`[data-tab="${tabId}"]`);

    if (tabElement) tabElement.classList.remove('hidden');
    if (btnElement) btnElement.classList.add('active');

    if (tabId === 'projection' && window.currentData) {
        engine.runProjection(window.currentData);
    }
}

function addRow(containerId, type, data = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isCard = type === 'income';
    const element = document.createElement(isCard ? 'div' : 'tr');
    
    element.innerHTML = templates[type]();
    container.appendChild(element);

    attachInputListeners(element);

    if (data) {
        fillRow(element, data);
    } else {
        // If it's a new row, trigger a save immediately
        autoSave();
    }
    
    return element;
}

function attachInputListeners(element) {
    element.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', autoSave);
    });

    element.querySelectorAll('input[type="range"]').forEach(slider => {
        const display = slider.previousElementSibling.querySelector('span');
        slider.addEventListener('input', () => {
            display.textContent = `${slider.value}%`;
        });
    });

    const typeSelect = element.querySelector('[data-id="type"]');
    if (typeSelect) {
        const updateAssetType = () => {
            const selectedValue = typeSelect.value;
            const costBasisCell = element.querySelector('.cost-basis-cell');
            if (costBasisCell) {
                costBasisCell.classList.toggle('hidden', selectedValue !== 'Post-Tax (Roth)');
            }
            typeSelect.style.color = assetClassColors[selectedValue] || '#e2e8f0';
            updateCostBasisHeaderVisibility();
        };

        typeSelect.addEventListener('change', updateAssetType);
        updateAssetType(); // Initial call
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
            // Dispatch events to ensure sliders and other listeners update
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
}

function updateCostBasisHeaderVisibility() {
    const investmentRows = document.getElementById('investment-rows');
    if (!investmentRows) return;

    const typeSelects = investmentRows.querySelectorAll('[data-id="type"]');
    const hasRoth = Array.from(typeSelects).some(select => select.value === 'Post-Tax (Roth)');

    const costBasisHeader = document.querySelector('th.cost-basis-cell');
    if (costBasisHeader) {
        costBasisHeader.classList.toggle('hidden', !hasRoth);
    }
}

// Make functions globally available if they need to be called from the data layer
window.addRow = addRow;
window.updateSummaries = updateSummaries;
window.updateCostBasisHeaderVisibility = updateCostBasisHeaderVisibility;