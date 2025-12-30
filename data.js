/**
 * DATA.JS - Firestore Persistence & Auto-Save
 * Uses engine.getTableData from math.js to avoid redundancy.
 */

window.autoSave = async () => {
    if (!window.currentUser) return;

    const data = {
        lastUpdated: new Date().toISOString(),
        birthYear: document.getElementById('user-birth-year')?.value || "1986",
        // Financial Data Scraped via engine tools
        investments: engine.getTableData('#investment-rows tr', ['name', 'class', 'value', 'basis']),
        realEstate: engine.getTableData('#housing-list tr', ['name', 'value', 'debt', 'tax']),
        otherAssets: engine.getTableData('#other-assets-list tr', ['name', 'value', 'debt']),
        debts: engine.getTableData('#debt-rows tr', ['name', 'balance']),
        savingsContributions: engine.getTableData('#savings-list tr', ['name', 'class', 'amount']),
        expenses: engine.getTableData('#budget-list tr', ['name', 'amount', 'payoffYear']),
        // Income is complex, we grab it specifically
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
                contribIncBonus: checks[0].checked,
                matchIncBonus: checks[1].checked
            };
        })
    };

    try {
        const { doc, setDoc, db } = window.firebaseInstance;
        await setDoc(doc(db, "users", window.currentUser.uid), data, { merge: true });
        console.log("Auto-saved to Firebase");
    } catch (e) {
        console.error("Save error:", e);
    }
};

window.loadUserData = async (user) => {
    const { doc, getDoc, db } = window.firebaseInstance;
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // 1. Set Birth Year
        if (data.birthYear) {
            document.getElementById('user-birth-year').value = data.birthYear;
            engine.updateAgeDisplay();
        }

        // 2. Clear and Populate Tables
        const tableMap = {
            'investment-rows': { data: data.investments, type: 'investment' },
            'housing-list': { data: data.realEstate, type: 'housing' },
            'other-assets-list': { data: data.otherAssets, type: 'other' },
            'debt-rows': { data: data.debts, type: 'debt' },
            'savings-list': { data: data.savingsContributions, type: 'savings-item' },
            'budget-list': { data: data.expenses, type: 'budget-item' },
            'income-list': { data: data.income, type: 'income' }
        };

        Object.entries(tableMap).forEach(([id, config]) => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = ''; // Clear defaults
                if (config.data) config.data.forEach(item => window.addRow(id, config.type, item));
            }
        });
    }
};