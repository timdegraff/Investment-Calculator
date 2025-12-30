/**
 * DATA.JS - Firestore Persistence
 * Aligned with auth.js "financialData" structure and "loadUserDataIntoUI" hook.
 */

window.autoSave = async () => {
    const user = window.auth ? window.auth.currentUser : null;
    if (!user) return;

    const data = {
        lastUpdated: new Date().toISOString(),
        birthYear: document.getElementById('user-birth-year')?.value || "1986",
        investments: engine.getTableData('#investment-rows tr', ['name', 'class', 'value']),
        realEstate: engine.getTableData('#housing-list tr', ['name', 'value', 'debt', 'tax']),
        otherAssets: engine.getTableData('#other-assets-list tr', ['name', 'value', 'debt']),
        debts: engine.getTableData('#debt-rows tr', ['name', 'balance']),
        savingsContributions: engine.getTableData('#savings-list tr', ['name', 'class', 'amount']),
        expenses: engine.getTableData('#budget-rows tr', ['name', 'amount', 'payoffYear']),
        income: engine.getTableData('#income-list > div', ['name', 'amount', 'bonusPct', 'increase', 'contribution', 'match', 'contribIncBonus', 'matchIncBonus']),
        assumptions: {
            stockGrowth: math.getSliderValue('input-stockGrowth'),
            reAppreciation: math.getSliderValue('input-reAppreciation'),
            inflation: math.getSliderValue('input-inflation')
        }
    };

    if (window.saveUserData) {
        window.saveUserData(data);
    }
    
    // Also, re-run the projection with the new data
    if(window.engine) {
        engine.runProjection(data);
    }
};

window.loadUserDataIntoUI = (data) => {
    if (!data) return;

    document.getElementById('user-birth-year').value = data.birthYear || '1986';
    engine.updateAgeDisplay();

    const tables = {
        'investment-rows': { items: data.investments, type: 'investment' },
        'housing-list': { items: data.realEstate, type: 'housing' },
        'other-assets-list': { items: data.otherAssets, type: 'other' },
        'debt-rows': { items: data.debts, type: 'debt' },
        'savings-list': { items: data.savingsContributions, type: 'savings-item' },
        'budget-rows': { items: data.expenses, type: 'budget-item' },
        'income-list': { items: data.income, type: 'income' }
    };

    for (const [id, { items, type }] of Object.entries(tables)) {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '';
            if (items && Array.isArray(items)) {
                items.forEach(item => window.addRow(id, type, item));
            }
        }
    }

    if (data.assumptions) {
        for (const [key, value] of Object.entries(data.assumptions)) {
            const input = document.getElementById(`input-${key}`);
            const display = document.getElementById(`val-${key}`);
            if (input) input.value = value;
            if (display) display.innerText = value + '%';
        }
    }
    
    if (data.investments && window.renderAssetAllocationChart) {
        window.renderAssetAllocationChart(data.investments);
    }

    // Initial projection run after loading
    engine.runProjection(data);
};

function populateForm(container, data) {
    if (!data) return;
    const inputs = container.querySelectorAll('input, select');
    const fields = Array.from(inputs).map(i => i.name || i.id).filter(Boolean);

    fields.forEach(field => {
        const input = inputs.find(i => i.name === field || i.id === field);
        if (input && data[field] !== undefined) {
            if (input.type === 'checkbox') {
                input.checked = data[field];
            } else if (input.type === 'range') {
                input.value = data[field];
                const display = document.getElementById(`val-${input.id.replace('input-', '')}`);
                if (display) display.innerText = `${data[field]}%`;
            } else {
                input.value = data[field];
            }
        }
    });
}