
import { loginWithGoogle, logoutUser } from './auth.js';
import { templates } from './templates.js';
import { autoSave } from './data.js';
import { engine, math, assumptions } from './utils.js';

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

// --- INITIALIZATION ---
export function initializeUI() {
    console.log("Initializing UI and event listeners...");
    showTab('assets-debts');
    attachGlobalListeners();
    attachNavigationListeners();
    attachDynamicRowListeners();
    attachSortingListeners();
    console.log("UI Initialized.");
}

// --- EVENT LISTENER SETUP ---

function attachGlobalListeners() {
    document.getElementById('login-btn').addEventListener('click', loginWithGoogle);
    document.getElementById('logout-btn').addEventListener('click', logoutUser);

    // Global listener for inputs to trigger autosave
    document.body.addEventListener('input', (e) => {
        if (e.target.closest('.input-base, .income-card, #assumptions-container, .real-estate-card')) {
            debouncedAutoSave();
        }
    });
}

function attachNavigationListeners() {
    document.getElementById('main-nav').addEventListener('click', (e) => {
        const tabButton = e.target.closest('.tab-btn');
        if (tabButton && tabButton.dataset.tab) {
            showTab(tabButton.dataset.tab);
        }
    });
}

// Handles clicks for "Add" and "Remove" buttons
function attachDynamicRowListeners() {
    document.body.addEventListener('click', (e) => {
        const addButton = e.target.closest('[data-add-row]');
        const removeButton = e.target.closest('[data-action="remove"]');

        if (addButton) {
            const containerId = addButton.dataset.addRow;
            const type = addButton.dataset.rowType;
            if (containerId && type) {
                addRow(containerId, type);
                debouncedAutoSave(); // Save after adding a new row
            }
        } else if (removeButton) {
            const row = removeButton.closest('tr, .income-card');
            if (row) {
                row.remove();
                debouncedAutoSave();
            }
        }
    });
}

function attachSortingListeners() {
    const budgetTableHead = document.querySelector('#budget-expenses-table thead');
    if (budgetTableHead) {
        budgetTableHead.addEventListener('click', (e) => {
            const header = e.target.closest('[data-sort]');
            if (header) {
                sortBudgetTable(header.dataset.sort, header);
            }
        });
    }
}


// --- UI MANIPULATION & LOGIC ---

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
    const newElement = document.createElement(isCard ? 'div' : 'tr');
    
    if (!isCard) {
        newElement.className = 'border-b border-slate-700 hover:bg-slate-700/50';
    } else {
        newElement.className = 'income-card bg-slate-800 rounded-2xl p-5 shadow-lg'; 
    }

    newElement.innerHTML = templates[type]();
    container.appendChild(newElement);

    attachInputListeners(newElement);

    if (data) {
        window.fillRow(newElement, data);
    }
    
    return newElement;
}


function attachInputListeners(element) {
    // Budget auto-calculation
    const monthlyInput = element.querySelector('[data-id="monthly"]');
    const annualInput = element.querySelector('[data-id="annual"]');
    if (monthlyInput && annualInput) {
        const onMonthlyInput = () => {
            const monthlyValue = math.fromCurrency(monthlyInput.value);
            annualInput.value = math.toCurrency(monthlyValue * 12, false);
            debouncedAutoSave();
        };
        const onAnnualInput = () => {
            const annualValue = math.fromCurrency(annualInput.value);
            monthlyInput.value = math.toCurrency(annualValue / 12, false);
            debouncedAutoSave();
        };
        monthlyInput.addEventListener('input', onMonthlyInput);
        annualInput.addEventListener('input', onAnnualInput);
    }

    // Income card sliders
    element.querySelectorAll('input[type="range"]').forEach(slider => {
        const display = slider.parentElement.querySelector('span');
        if (display) {
            const updateDisplay = () => display.textContent = `${slider.value}%`;
            slider.addEventListener('input', updateDisplay);
            updateDisplay(); // Set initial value
        }
    });

    // Currency formatting on blur
    element.querySelectorAll('[data-type="currency"]').forEach(input => {
        input.addEventListener('blur', (e) => {
            const value = math.fromCurrency(e.target.value);
            e.target.value = math.toCurrency(value, false);
        });
         input.addEventListener('focus', (e) => {
            const value = math.fromCurrency(e.target.value);
            if (value !== 0) {
                e.target.value = value;
            }
        });
    });
}

function sortBudgetTable(sortKey, header) {
    const tableBody = document.getElementById('budget-rows');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    
    const currentSort = tableBody.dataset.sortKey;
    const currentOrder = tableBody.dataset.sortOrder;
    let newOrder = 'desc';
    if (currentSort === sortKey && currentOrder === 'desc') {
        newOrder = 'asc';
    }
    
    rows.sort((a, b) => {
        const aValue = math.fromCurrency(a.querySelector(`[data-id="${sortKey}"]`).value);
        const bValue = math.fromCurrency(b.querySelector(`[data-id="${sortKey}"]`).value);
        return newOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    rows.forEach(row => tableBody.appendChild(row));
    
    tableBody.dataset.sortKey = sortKey;
    tableBody.dataset.sortOrder = newOrder;

    document.querySelectorAll('#budget-expenses-table th i.fas').forEach(icon => {
        icon.className = 'fas fa-sort text-slate-500';
    });
    const headerIcon = header.querySelector('i.fas');
    headerIcon.className = `fas fa-sort-${newOrder === 'asc' ? 'up' : 'down'}`;
}

function createAssumptionControls(data) {
    const container = document.getElementById('assumptions-container');
    if (!container) return;
    container.innerHTML = '';

    const controlDefs = {
        currentAge: { label: 'Current Age', min: 18, max: 100, step: 1, unit: ' years' },
        investmentGrowth: { label: 'Avg. Annual Growth', min: 0, max: 20, step: 0.5, unit: '%' },
    };

    Object.entries(controlDefs).forEach(([key, def]) => {
        const value = data.assumptions[key] !== undefined ? data.assumptions[key] : assumptions.defaults[key];
        const controlWrapper = document.createElement('div');
        controlWrapper.className = 'space-y-2';

        const controlHtml = `
            <label class="flex justify-between items-center font-bold text-slate-300">
                ${def.label}
                <span class="text-lg font-black text-blue-400">${value}${def.unit}</span>
            </label>
            <input type="range" data-id="${key}" min="${def.min}" max="${def.max}" step="${def.step}" value="${value}" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500">
        `;
        controlWrapper.innerHTML = controlHtml;

        const slider = controlWrapper.querySelector('input[type="range"]');
        const display = controlWrapper.querySelector('span');

        slider.addEventListener('input', () => {
            display.textContent = `${slider.value}${def.unit}`;
        });

        container.appendChild(controlWrapper);
    });
}

// Make functions globally available
window.addRow = addRow;
window.createAssumptionControls = createAssumptionControls;

window.fillRow = (row, data) => {
    Object.keys(data).forEach(key => {
        const input = row.querySelector(`[data-id="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = !!data[key];
            } else if (input.dataset.type === 'currency') {
                input.value = math.toCurrency(data[key], false);
            } else {
                input.value = data[key];
            }
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
};