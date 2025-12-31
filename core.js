
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

const debouncedAutoSave = debounce(autoSave, 500);

// --- INITIALIZATION ---
export function initializeUI() {
    showTab('assets-debts');
    attachGlobalListeners();
    attachNavigationListeners();
    attachDynamicRowListeners();
    attachSortingListeners();
    initializeSortable();
}

// --- EVENT LISTENER SETUP ---

function attachGlobalListeners() {
    document.getElementById('login-btn').addEventListener('click', loginWithGoogle);
    document.getElementById('logout-btn').addEventListener('click', logoutUser);

    document.body.addEventListener('input', (e) => {
        const target = e.target;
        if (target.closest('.input-base, .income-card, #assumptions-container, .input-range')) {
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

function attachDynamicRowListeners() {
    document.body.addEventListener('click', (e) => {
        const addButton = e.target.closest('[data-add-row]');
        const removeButton = e.target.closest('[data-action="remove"]');

        if (addButton) {
            const containerId = addButton.dataset.addRow;
            const type = addButton.dataset.rowType;
            addRow(containerId, type);
            debouncedAutoSave();
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
            if (header) sortBudgetTable(header.dataset.sort, header);
        });
    }
}

function initializeSortable() {
    const investmentRows = document.getElementById('investment-rows');
    if (investmentRows) {
        new Sortable(investmentRows, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'bg-slate-700',
            onEnd: () => debouncedAutoSave()
        });
    }
}


// --- UI MANIPULATION & LOGIC ---

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const tabEl = document.getElementById(`tab-${tabId}`);
    const btnEl = document.querySelector(`[data-tab="${tabId}"]`);

    if (tabEl) tabEl.classList.remove('hidden');
    if (btnEl) btnEl.classList.add('active');

    if (tabId === 'projection' && window.currentData) {
        engine.runProjection(window.currentData);
    }
}

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
}

function attachInputListeners(element) {
    // Budget auto-calculation
    const monthlyInput = element.querySelector('[data-id="monthly"]');
    const annualInput = element.querySelector('[data-id="annual"]');
    if (monthlyInput && annualInput) {
        monthlyInput.addEventListener('input', () => {
            annualInput.value = math.toCurrency(math.fromCurrency(monthlyInput.value) * 12, false);
        });
        annualInput.addEventListener('input', () => {
            monthlyInput.value = math.toCurrency(math.fromCurrency(annualInput.value) / 12, false);
        });
    }

    // Income card sliders
    element.querySelectorAll('input[type="range"]').forEach(slider => {
        const display = slider.previousElementSibling.querySelector('span');
        if (display) {
            const updateDisplay = () => display.textContent = `${slider.value}%`;
            slider.addEventListener('input', updateDisplay);
            updateDisplay(); // Set initial value
        }
    });

    // Investment type dependency
    const typeSelect = element.querySelector('select[data-id="type"]');
    if (typeSelect) {
        const costBasisInput = element.querySelector('input[data-id="costBasis"]');
        const handleTypeChange = () => {
            const selectedType = typeSelect.value;
            const isTaxable = selectedType === 'Taxable';
            const isRoth = selectedType === 'Post-Tax (Roth)';

            costBasisInput.disabled = !(isTaxable || isRoth);

            if (!isTaxable && !isRoth) {
                costBasisInput.value = 'N/A';
            } else if (costBasisInput.value === 'N/A') {
                costBasisInput.value = ''; // Clear N/A if it becomes enabled
            }
        };
        typeSelect.addEventListener('change', handleTypeChange);
        handleTypeChange();
    }

    // General input formatting
    element.querySelectorAll('input').forEach(input => {
        if (input.dataset.type === 'currency') {
            input.addEventListener('blur', (e) => e.target.value = math.toCurrency(math.fromCurrency(e.target.value), false));
            input.addEventListener('focus', (e) => {
                const value = math.fromCurrency(e.target.value);
                if (value === 0) {
                    e.target.value = '';
                } else {
                    e.target.value = value;
                }
            });
        }
    });
}

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

function createAssumptionControls(data) {
    const container = document.getElementById('assumptions-container');
    if (!container) return;
    container.innerHTML = ''; // Clear previous controls

    const controlDefs = {
        currentAge: { label: 'Current Age', min: 18, max: 100, step: 1, unit: ' years', defaultValue: 40 },
        stockGrowth: { label: 'Stock Growth 📈', min: 0, max: 20, step: 0.5, unit: '%', defaultValue: 7 },
        cryptoGrowth: { label: 'Crypto Growth ₿', min: -20, max: 50, step: 1, unit: '%', defaultValue: 10 },
        metalsGrowth: { label: 'Metals Growth 🪙', min: -10, max: 20, step: 0.5, unit: '%', defaultValue: 2 },
    };

    Object.entries(controlDefs).forEach(([key, def]) => {
        const value = data.assumptions?.[key] ?? def.defaultValue;
        const controlWrapper = document.createElement('div');
        controlWrapper.className = 'space-y-2';
        controlWrapper.innerHTML = `
            <label class="flex justify-between items-center font-bold text-slate-300">
                ${def.label}
                <span class="text-lg font-black text-blue-400">${value}${def.unit}</span>
            </label>
            <input type="range" data-id="${key}" min="${def.min}" max="${def.max}" step="${def.step}" value="${value}" class="input-range">
        `;
        
        const slider = controlWrapper.querySelector('input[type="range"]');
        const display = controlWrapper.querySelector('span');
        
        const updateDisplay = () => display.textContent = `${slider.value}${def.unit}`;
        
        slider.addEventListener('input', () => {
            updateDisplay();
            // No need to call runProjection here as the global input listener handles it via debouncedAutoSave
        });

        container.appendChild(controlWrapper);
        updateDisplay(); // Set initial text
    });
}

window.addRow = addRow;
window.createAssumptionControls = createAssumptionControls;

window.fillRow = (row, data) => {
    if (!data) return;
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