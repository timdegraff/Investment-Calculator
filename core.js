
import { loginWithGoogle, logoutUser } from './auth.js';
import { templates } from './templates.js';
import { autoSave, updateSummaries } from './data.js';
import { engine, math, assetClassColors, assumptions } from './utils.js';

// --- DEBOUNCE UTILITY ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedAutoSave = debounce(autoSave, 500); // 500ms delay

// This single function is exported to main.js to initialize the entire UI.
export function initializeUI() {
    console.log("Initializing UI and event listeners...");

    // Set initial tab
    showTab('assets-debts');

    // Attach all event listeners
    attachGlobalListeners();
    attachNavigationListeners();
    attachDynamicRowListeners();
    attachSortingListeners(); // New listener for sorting
    
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
            const row = removeButton.closest('tr, .income-card, .real-estate-card');
            if (row) {
                row.remove();
                debouncedAutoSave();
            }
        }
    });
}

function attachSortingListeners() {
    document.querySelector('#tab-budget thead').addEventListener('click', (e) => {
        const header = e.target.closest('[data-sort]');
        if (header) {
            const sortKey = header.dataset.sort;
            sortBudgetTable(sortKey);
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
    }
    
    return element;
}

function attachInputListeners(element) {
    // Attach autosave listener to all inputs within the element
    element.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', debouncedAutoSave);
    });

    // Budget auto-calculation
    const monthlyInput = element.querySelector('[data-id="monthly"]');
    const annualInput = element.querySelector('[data-id="annual"]');
    if (monthlyInput && annualInput) {
        monthlyInput.addEventListener('input', () => {
            const monthlyValue = math.fromCurrency(monthlyInput.value);
            annualInput.value = math.toCurrency(monthlyValue * 12, true);
        });
        annualInput.addEventListener('input', () => {
            const annualValue = math.fromCurrency(annualInput.value);
            monthlyInput.value = math.toCurrency(annualValue / 12, true);
        });
    }

    // Income card sliders
    const incomeCard = element.closest('.income-card');
    if (incomeCard) {
        incomeCard.querySelectorAll('input[type="range"]').forEach(slider => {
            const display = slider.previousElementSibling.querySelector('span');
            slider.addEventListener('input', () => {
                display.textContent = `${slider.value}%`;
            });
        });
    }
}

function sortBudgetTable(sortKey) {
    const tableBody = document.getElementById('budget-rows');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const isAscending = tableBody.dataset.sortOrder === 'asc';

    rows.sort((a, b) => {
        const aValue = math.fromCurrency(a.querySelector(`[data-id="${sortKey}"]`).value);
        const bValue = math.fromCurrency(b.querySelector(`[data-id="${sortKey}"]`).value);
        return isAscending ? aValue - bValue : bValue - aValue;
    });

    rows.forEach(row => tableBody.appendChild(row));
    tableBody.dataset.sortOrder = isAscending ? 'desc' : 'asc';

    // Update sort icons
    document.querySelectorAll('#tab-budget th .fa-sort, #tab-budget th .fa-sort-up, #tab-budget th .fa-sort-down').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    const headerIcon = document.querySelector(`#tab-budget [data-sort="${sortKey}"] i`);
    headerIcon.className = `fas fa-sort-${isAscending ? 'up' : 'down'}`;
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
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
}

export function createAssumptionControls(data) {
    const container = document.getElementById('assumptions-container');
    if (!container) return;
    container.innerHTML = ''; // Clear existing controls

    const controlDefs = {
        currentAge: { label: 'Current Age', min: 18, max: 100, step: 1, unit: ' years' },
        retirementAge: { label: 'Retirement Age', min: 40, max: 80, step: 1, unit: ' years' },
        investmentGrowth: { label: 'Investment Growth', min: 0, max: 20, step: 0.5, unit: '%' },
        swr: { label: 'Safe Withdrawal Rate', min: 1, max: 10, step: 0.1, unit: '%' },
        taxRate: { label: 'Effective Tax Rate', min: 0, max: 50, step: 1, unit: '%' },
    };

    Object.entries(controlDefs).forEach(([key, def]) => {
        const value = data.assumptions[key] || assumptions.defaults[key];
        const controlWrapper = document.createElement('div');

        const controlHtml = `
            <label class="flex justify-between items-center font-bold text-slate-300 mb-2">
                ${def.label}
                <span class="text-lg font-black text-blue-400">${value}${def.unit}</span>
            </label>
            <input type="range" data-id="${key}" min="${def.min}" max="${def.max}" step="${def.step}" value="${value}" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
        `;
        controlWrapper.innerHTML = controlHtml;

        const slider = controlWrapper.querySelector('input[type="range"]');
        const display = controlWrapper.querySelector('span');

        slider.addEventListener('input', () => {
            display.textContent = `${slider.value}${def.unit}`;
            debouncedAutoSave();
        });

        container.appendChild(controlWrapper);
    });
}


// Make functions globally available if they need to be called from the data layer
window.addRow = addRow;
window.updateSummaries = updateSummaries;
window.createAssumptionControls = createAssumptionControls;
window.fillRow = fillRow;