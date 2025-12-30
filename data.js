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

    // Collect data from the UI
    const data = {
        lastUpdated: new Date().toISOString(),
        assumptions: {
            birthYear: document.getElementById('user-birth-year')?.value || "1986",
            retAge: document.getElementById('input-retAge')?.value || "55",
            stockGrowth: document.getElementById('input-stockGrowth')?.value || "7",
            reAppreciation: document.getElementById('input-reAppreciation')?.value || "3",
            inflation: document.getElementById('input-inflation')?.value || "3",
            drawEarly: document.getElementById('input-drawEarly')?.value || "4",
        },
        investments: getTableData('investment-rows', ['name', 'class', 'value']),
        realEstate: getTableData('housing-list', ['name', 'value', 'debt']),
        otherAssets: getTableData('other-assets-list', ['name', 'value', 'debt']),
        debts: getTableData('debt-rows', ['name', 'balance']),
        income: getCardData('income-list'),
        manualSavings: getTableData('savings-list', ['name', 'type', 'amount']),
        expenses: getTableData('budget-rows', ['name', 'amount'])
    };

    window.currentData = data; // Keep a global reference

    if (window.saveUserData) {
        window.saveUserData(data);
        console.log("Auto-saving data...", data);
    }

    // Always update summaries and projection on data change
    window.updateSummaries(data);
}, 500); // 500ms delay for debouncing


// Function to load user data into the UI
window.loadUserDataIntoUI = (data) => {
    if (!data) {
        console.log("No data found, loading defaults for new user.");
        data = getNewUserDefaultData();
    }
    window.currentData = data;

    // 1. Load Assumptions
    if (data.assumptions) {
        for (const [key, value] of Object.entries(data.assumptions)) {
            const input = document.getElementById(key === 'birthYear' ? 'user-birth-year' : `input-${key}`);
            const display = document.getElementById(`val-${key}`);
            if (input) input.value = value;
            if (display) display.textContent = value + '%';
        }
    }

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
        assumptions: { birthYear: "1990", retAge: "65", stockGrowth: "8", reAppreciation: "3", inflation: "2.5", drawEarly: "4" },
        investments: [],
        realEstate: [],
        otherAssets: [],
        debts: [],
        income: [],
        manualSavings: [],
        expenses: [
            { id: `budget_${Date.now()}_1`, name: "Mortgage / Rent", amount: "1500" },
            { id: `budget_${Date.now()}_2`, name: "Car Payment", amount: "500" },
            { id: `budget_${Date.now()}_3`, name: "Utilities", amount: "300" },
        ]
    };
}

// Helper to get data from a simple table structure
function getTableData(containerId, fields) {
    const rows = document.getElementById(containerId)?.querySelectorAll('tr');
    if (!rows) return [];
    return Array.from(rows).map(row => {
        const data = { id: row.id };
        const inputs = row.querySelectorAll('input, select');
        inputs.forEach((input, index) => {
            const fieldName = fields[index];
            if (fieldName) {
                data[fieldName] = input.type === 'checkbox' ? input.checked : input.value;
            }
        });
        return data;
    });
}

// Helper to get data from the more complex income cards
function getCardData(containerId) {
    const cards = document.getElementById(containerId)?.querySelectorAll('.income-card');
    if (!cards) return [];
    return Array.from(cards).map(card => {
        const data = { id: card.id };
        card.querySelectorAll('input, select').forEach(input => {
            const id = input.dataset.id;
            if (id) {
                data[id] = input.type === 'checkbox' ? input.checked : input.value;
            }
        });
        return data;
    });
}
