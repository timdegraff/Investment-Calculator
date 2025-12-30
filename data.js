/**
 * DATA.JS - Firestore Data Persistence and UI Binding
 * Handles saving data to Firebase and loading it back into the UI.
 */

// Debounced auto-save function
const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

window.autoSave = debounce(() => {
    const user = window.auth ? window.auth.currentUser : null;
    if (!user) return;

    const data = gatherData();
    window.currentData = data; // Keep a global reference

    if (window.saveUserData) {
        window.saveUserData(data);
        console.log("Auto-saving data...", data);
    }

    window.updateSummaries(data);
}, 500);


function gatherData() {
    const data = { lastUpdated: new Date().toISOString() };

    // 1. Gather Assumptions
    data.assumptions = {};
    for (const key in assumptions.sliders) {
        const input = document.getElementById(`input-${key}`);
        if (input) {
            data.assumptions[key] = parseFloat(input.value);
        }
    }

    // 2. Gather Table and Card Data
    data.investments = getTableData('investment-rows', ['name', 'class', 'value']);
    data.realEstate = getTableData('housing-list', ['name', 'value', 'debt']);
    data.otherAssets = getTableData('other-assets-list', ['name', 'value', 'debt']);
    data.debts = getTableData('debt-rows', ['name', 'balance']);
    data.income = getCardData('income-list');
    data.manualSavings = getTableData('savings-list', ['name', 'class', 'monthly', 'annual']);
    data.expenses = getTableData('budget-rows', ['name', 'monthly', 'annual']);

    return data;
}

window.loadUserDataIntoUI = (data) => {
    if (!data) {
        console.log("No data found, loading defaults for new user.");
        data = getNewUserDefaultData();
    }
    window.currentData = data;

    // 1. Load Assumptions
    assumptions.load(data.assumptions);

    // 2. Load Tables
    const tables = {
        'investment-rows': { items: data.investments, type: 'investment' },
        'housing-list': { items: data.realEstate, type: 'housing' },
        'other-assets-list': { items: data.otherAssets, type: 'other' },
        'debt-rows': { items: data.debts, type: 'debt' },
        'savings-list': { items: data.manualSavings, type: 'savings-item' },
        'budget-rows': { items: data.expenses, type: 'budget-item' },
        'income-list': { items: data.income, type: 'income' }
    };

    for (const [id, { items, type }] of Object.entries(tables)) {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = ''; // Clear existing rows
            if (items && Array.isArray(items)) {
                items.forEach(item => window.addRow(id, type, item));
            }
        }
    }

    // 3. Initial full summary calculation and projection run
    window.updateSummaries(data);
};

function getNewUserDefaultData() {
    return {
        assumptions: assumptions.defaults,
        investments: [],
        realEstate: [],
        otherAssets: [],
        debts: [],
        income: [],
        manualSavings: [],
        expenses: [
            { name: "Mortgage / Rent", monthly: "1500", annual: "18000" },
            { name: "Car Payment", monthly: "500", annual: "6000" },
            { name: "Utilities", monthly: "300", annual: "3600" },
        ]
    };
}

function getTableData(containerId, fields) {
    const rows = document.getElementById(containerId)?.querySelectorAll('tr');
    if (!rows) return [];
    return Array.from(rows).map(row => {
        const data = {};
        fields.forEach(field => {
            const input = row.querySelector(`[data-id="${field}"]`);
            if (input) {
                 data[field] = input.type === 'checkbox' ? input.checked : input.value;
            }
        });
        return data;
    });
}

function getCardData(containerId) {
    const cards = document.getElementById(containerId)?.querySelectorAll('.income-card');
    if (!cards) return [];
    return Array.from(cards).map(card => {
        const data = {};
        card.querySelectorAll('input, select').forEach(input => {
            const id = input.dataset.id;
            if (id) {
                data[id] = input.type === 'checkbox' ? input.checked : input.value;
            }
        });
        return data;
    });
}
