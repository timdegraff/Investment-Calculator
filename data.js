/**
 * DATA.JS - Firestore Persistence
 * Aligned with auth.js "financialData" structure and "loadUserDataIntoUI" hook.
 */

window.autoSave = async () => {
    // Check if Firebase Auth is ready and user is logged in
    const user = window.auth ? window.auth.currentUser : null;
    if (!user) return;

    const data = {
        lastUpdated: new Date().toISOString(),
        birthYear: document.getElementById('user-birth-year')?.value || "1986",
        investments: engine.getTableData('#investment-rows tr', ['name', 'class', 'value', 'basis']),
        realEstate: engine.getTableData('#housing-list tr', ['name', 'value', 'debt', 'tax']),
        otherAssets: engine.getTableData('#other-assets-list tr', ['name', 'value', 'debt']),
        debts: engine.getTableData('#debt-rows tr', ['name', 'balance']),
        savingsContributions: engine.getTableData('#savings-list tr', ['name', 'class', 'amount']),
        expenses: engine.getTableData('#budget-rows tr', ['name', 'amount', 'payoffYear']),
        income: Array.from(document.querySelectorAll('#income-list > div')).map(div => {
            const inputs = div.querySelectorAll('input');
            const ranges = div.querySelectorAll('input[type=range]');
            const checks = div.querySelectorAll('input[type=checkbox]');
            return {
                name: inputs[0].value,
                amount: parseFloat(inputs[1].value) || 0,
                bonusPct: parseFloat(inputs[2].value) || 0,
                nonTaxYear: parseInt(inputs[3].value) || 0,
                increase: parseFloat(ranges[0].value) || 0,
                contribution: parseFloat(ranges[1].value) || 0,
                match: parseFloat(ranges[2].value) || 0,
                contribIncBonus: checks[0]?.checked || false,
                matchIncBonus: checks[1]?.checked || false
            };
        }),
        // Capture assumptions sliders
        assumptions: {
            stockGrowth: document.getElementById('input-stockGrowth')?.value || 7,
            reAppreciation: document.getElementById('input-reAppreciation')?.value || 3,
            inflation: document.getElementById('input-inflation')?.value || 3
        }
    };

    // Use the existing save function from auth.js to maintain consistency
    if (window.saveUserData) {
        window.saveUserData(data);
    }
};

// This is the hook auth.js calls when a user logs in
window.loadUserDataIntoUI = (data) => {
    if (!data) return;

    // 1. Set Birth Year
    if (data.birthYear) {
        document.getElementById('user-birth-year').value = data.birthYear;
        if (window.engine?.updateAgeDisplay) window.engine.updateAgeDisplay();
    }

    // 2. Map of Table IDs to Data Keys
    const tableMap = {
        'investment-rows': { items: data.investments, type: 'investment' },
        'housing-list': { items: data.realEstate, type: 'housing' },
        'other-assets-list': { items: data.otherAssets, type: 'other' },
        'debt-rows': { items: data.debts, type: 'debt' },
        'savings-list': { items: data.savingsContributions, type: 'savings-item' },
        'budget-rows': { items: data.expenses, type: 'budget-item' },
        'income-list': { items: data.income, type: 'income' }
    };

    // 3. Populate Tables
    Object.entries(tableMap).forEach(([id, config]) => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = ''; // Clear defaults
            if (config.items && Array.isArray(config.items)) {
                config.items.forEach(item => window.addRow(id, config.type, item));
            }
        }
    });

    // 4. Restore Assumptions Sliders
    if (data.assumptions) {
        Object.entries(data.assumptions).forEach(([key, val]) => {
            const input = document.getElementById(`input-${key}`);
            const display = document.getElementById(`val-${key}`);
            if (input) input.value = val;
            if (display) display.innerText = val + '%';
        });
    }
};