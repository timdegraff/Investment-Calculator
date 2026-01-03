
import { signInWithGoogle, logoutUser } from './auth.js';
import { templates } from './templates.js';
import { autoSave } from './data.js';
import { engine, math } from './utils.js';
import { formatter } from './formatter.js';
import { burndown } from './burndown.js';

// Debounce utility to limit how often a function is called.
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

// Create a debounced version of the autoSave function.
const debouncedAutoSave = debounce(autoSave, 500);

// --- INITIALIZATION ---
export function initializeUI() {
    showTab('assets-debts');
    attachGlobalListeners();
    attachNavigationListeners();
    attachDynamicRowListeners();
    attachSortingListeners();
    initializeSortable();
    
    // Correctly expose the debounced autoSave function to the global window object.
    window.debouncedAutoSave = debouncedAutoSave;
}

// --- EVENT LISTENER SETUP ---

function attachGlobalListeners() {
    document.getElementById('login-btn').addEventListener('click', signInWithGoogle);
    document.getElementById('logout-btn').addEventListener('click', logoutUser);

    // A global input listener to trigger auto-save on any data change.
    document.body.addEventListener('input', (e) => {
        const target = e.target;
        if (target.closest('.input-base, .income-card, #assumptions-container, .input-range, .benefit-slider')) {
            window.debouncedAutoSave();
        }
    });
}

// Attach listeners to the main navigation tabs.
function attachNavigationListeners() {
    document.getElementById('main-nav').addEventListener('click', async (e) => {
        const tabButton = e.target.closest('.tab-btn');
        if (tabButton && tabButton.dataset.tab) {
            await showTab(tabButton.dataset.tab);
        }
    });
}

// Attach listeners for adding/removing dynamic rows (investments, debts, etc.).
function attachDynamicRowListeners() {
    document.body.addEventListener('click', (e) => {
        const addButton = e.target.closest('[data-add-row]');
        const removeButton = e.target.closest('[data-action="remove"]');

        if (addButton) {
            const containerId = addButton.dataset.addRow;
            const type = addButton.dataset.rowType;
            addRow(containerId, type);
            window.debouncedAutoSave();
        } else if (removeButton) {
            const row = removeButton.closest('tr, .income-card');
            if (row) {
                row.remove();
                window.debouncedAutoSave();
            }
        }
    });
}

// Attach listeners for sorting budget table columns.
function attachSortingListeners() {
    const budgetTableHead = document.querySelector('#budget-expenses-table thead');
    if (budgetTableHead) {
        budgetTableHead.addEventListener('click', (e) => {
            const header = e.target.closest('[data-sort]');
            if (header) sortBudgetTable(header.dataset.sort, header);
        });
    }
}

// Initialize drag-and-drop sorting for investment rows.
function initializeSortable() {
    const investmentRows = document.getElementById('investment-rows');
    if (investmentRows) {
        new Sortable(investmentRows, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'bg-slate-700',
            onEnd: () => window.debouncedAutoSave()
        });
    }
}

// --- UI MANIPULATION & LOGIC ---

// Handles switching between the main application tabs.
async function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const tabEl = document.getElementById(`tab-${tabId}`);
    const btnEl = document.querySelector(`[data-tab="${tabId}"]`);

    if (tabEl) tabEl.classList.remove('hidden');
    if (btnEl) btnEl.classList.add('active');

    // When switching to a simulation tab, scrape the latest data first.
    if ((tabId === 'projection' || tabId === 'burndown') && window.currentData) {
        await autoSave(true); // Force a scrape and save before running the simulation.
    }
}

// Adds a new row to a specified container using a template.
function addRow(containerId, type, data = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isCard = type === 'income';
    const newElement = document.createElement(isCard ? 'div' : 'tr');

    if (type === 'income') {
        newElement.className = 'income-card bg-slate-800 rounded-2xl p-5 shadow-lg';
    } else {
        newElement.className = 'border-b border-slate-700 hover:bg-slate-700/50';
    }

    newElement.innerHTML = templates[type](data);
    container.appendChild(newElement);

    attachInputListeners(newElement);
    window.fillRow(newElement, data);

    newElement.querySelectorAll('[data-type="currency"]').forEach(formatter.bindCurrencyEventListeners);
}

// Attaches specific input listeners to a newly created element.
function attachInputListeners(element) {
    // Auto-calculate annual/monthly values in budget rows.
    const monthlyInput = element.querySelector('[data-id="monthly"]');
    const annualInput = element.querySelector('[data-id="annual"]');
    if (monthlyInput && annualInput) {
        monthlyInput.addEventListener('input', () => {
            const monthlyValue = math.fromCurrency(monthlyInput.value);
            annualInput.value = formatter.formatCurrency(monthlyValue * 12, false);
        });
        annualInput.addEventListener('input', () => {
            const annualValue = math.fromCurrency(annualInput.value);
            monthlyInput.value = formatter.formatCurrency(annualValue / 12, false);
        });
    }
    
    // Update display for range sliders in income cards.
    element.querySelectorAll('input[type="range"]').forEach(slider => {
        const display = slider.previousElementSibling.querySelector('span');
        if (display) {
            const updateDisplay = () => display.textContent = `${slider.value}%`;
            slider.addEventListener('input', updateDisplay);
            updateDisplay();
        }
    });

    // Handle dependent fields for investment types (e.g., cost basis for Roth).
    const typeSelect = element.querySelector('select[data-id="type"]');
    if (typeSelect) {
        const costBasisInput = element.querySelector('input[data-id="costBasis"]');
        const handleTypeChange = () => {
            const selectedType = typeSelect.value;
            const isRoth = selectedType === 'Post-Tax (Roth)';
            costBasisInput.disabled = !isRoth;
            if (!isRoth) costBasisInput.value = 'N/A';
            else if (costBasisInput.value === 'N/A') costBasisInput.value = '';
        };
        typeSelect.addEventListener('change', handleTypeChange);
        handleTypeChange();
    }
}

// Sorts the budget expenses table by a given key.
function sortBudgetTable(sortKey, header) {
    const tableBody = document.getElementById('budget-expenses-rows');
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    const currentSort = tableBody.dataset.sortKey;
    const currentOrder = tableBody.dataset.sortOrder;
    const newOrder = (currentSort === sortKey && currentOrder === 'desc') ? 'asc' : 'desc';

    rows.sort((a, b) => {
        const aVal = math.fromCurrency(a.querySelector(`[data-id="${sortKey}"]`).value);
        const bVal = math.fromCurrency(b.querySelector(`[data-id="${sortKey}"]`).value);
        return newOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    rows.forEach(row => tableBody.appendChild(row));

    tableBody.dataset.sortKey = sortKey;
    tableBody.dataset.sortOrder = newOrder;

    document.querySelectorAll('#budget-expenses-table th i.fas').forEach(i => i.className = 'fas fa-sort text-slate-500');
    header.querySelector('i.fas').className = `fas fa-sort-${newOrder === 'asc' ? 'up' : 'down'}`;
}

// Creates the assumption control sliders in the projection tab.
function createAssumptionControls(data) {
    const container = document.getElementById('assumptions-container');
    if (!container) return;
    container.innerHTML = '';

    const controlDefs = {
        currentAge: { label: 'Current Age', min: 18, max: 80, step: 1, unit: ' years', defaultValue: 40 },
        retirementAge: { label: 'Retirement Age', min: 35, max: 72, step: 1, unit: ' years', defaultValue: 65 },
        inflation: { label: 'Inflation  inflación', min: 0, max: 10, step: 0.25, unit: '%', defaultValue: 3 },
        ssStartAge: { label: 'SS Start Age', min: 62, max: 70, step: 1, unit: ' years', defaultValue: 67 },
        ssMonthly: { label: 'SS Monthly', min: 0, max: 7000, step: 100, unit: '/mo', defaultValue: 2500, isCurrency: true },
        stockGrowth: { label: 'Stock Growth 📈', min: 0, max: 20, step: 0.5, unit: '%', defaultValue: 7 },
        cryptoGrowth: { label: 'Crypto Growth ₿', min: -20, max: 50, step: 1, unit: '%', defaultValue: 10 },
        metalsGrowth: { label: 'Metals Growth 🪙', min: -10, max: 20, step: 0.5, unit: '%', defaultValue: 2 },
    };

    Object.entries(controlDefs).forEach(([key, def]) => {
        const value = data.assumptions?.[key] ?? def.defaultValue;
        const controlWrapper = document.createElement('div');
        controlWrapper.className = 'space-y-2';
        const displayValue = def.isCurrency ? formatter.formatCurrency(value, false) : `${value}${def.unit}`;
        controlWrapper.innerHTML = `
            <label class="flex justify-between items-center font-bold text-slate-300">
                ${def.label}
                <span class="text-lg font-black text-blue-400">${displayValue}</span>
            </label>
            <input type="range" data-id="${key}" min="${def.min}" max="${def.max}" step="${def.step}" value="${value}" class="input-range">
        `;
        const slider = controlWrapper.querySelector('input[type="range"]');
        const display = controlWrapper.querySelector('span');
        const updateDisplay = () => {
            const sliderValue = parseFloat(slider.value);
            display.textContent = def.isCurrency ? formatter.formatCurrency(sliderValue, false) : `${sliderValue}${def.unit}`;
        };
        if (key === 'retirementAge') {
            const currentAgeSlider = document.querySelector('[data-id="currentAge"]');
            slider.addEventListener('input', () => {
                if (slider.value < currentAgeSlider.value) slider.value = currentAgeSlider.value;
                updateDisplay();
            });
        } else {
             slider.addEventListener('input', updateDisplay);
        }
        container.appendChild(controlWrapper);
        updateDisplay(); 
    });
}

// --- GLOBAL FUNCTIONS ---
// Expose functions to the global scope for use across different modules and for inline event handlers.

window.addRow = addRow;
window.createAssumptionControls = createAssumptionControls;

// Fills a newly created row with data.
window.fillRow = (row, data) => {
    if (!data) return;
    Object.keys(data).forEach(key => {
        const input = row.querySelector(`[data-id="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = !!data[key];
            } else if (input.dataset.type === 'currency') {
                input.value = formatter.formatCurrency(data[key], false);
                formatter.bindCurrencyEventListeners(input);
            } else {
                input.value = data[key];
            }
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
};
