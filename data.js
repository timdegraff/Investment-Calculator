import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { assumptions, math } from './utils.js';

let db;
let user;

export function initializeData(firestore, authUser) {
    db = firestore;
    user = authUser;
    loadData();
}

async function loadData() {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        window.currentData = docSnap.data();
    } else {
        window.currentData = getInitialData();
        console.log("No data found for user, initializing with default data.");
    }
    
    window.loadUserDataIntoUI(window.currentData);
}

window.loadUserDataIntoUI = (data) => {
    // Populate Investments
    data.investments?.forEach(item => window.addRow('investment-rows', 'investment', item));
    
    // Populate HELOC
    data.helocs?.forEach(item => window.addRow('heloc-rows', 'heloc', item));

    // Populate Liabilities
    data.debts?.forEach(item => window.addRow('debt-rows', 'debt', item));

    // Populate Income
    data.income?.forEach(item => window.addRow('income-rows', 'income', item));

    // Populate Savings
    data.savings?.forEach(item => window.addRow('savings-list', 'savings-item', item));

    // Populate Budget
    data.budget?.forEach(item => window.addRow('budget-rows', 'budget-item', item));

    // Populate Assumptions
    const assumptionsContainer = document.getElementById('assumptions-container');
    if (assumptionsContainer) {
        // ... (assumptions population logic)
    }
    
    window.updateCostBasisHeaderVisibility();
    window.updateSummaries(data);
};


window.autoSave = async () => {
    const data = { ...window.currentData };
    
    // Logic to scrape data from UI into the data object
    // ... (This logic remains the same)

    window.currentData = data;
    window.updateSummaries(data);

    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, data, { merge: true });
    console.log("Data saved.");
};

function getInitialData() {
    return { 
        assumptions: assumptions.defaults,
        investments: [],
        helocs: [],
        debts: [],
        income: [],
        savings: [],
        budget: [],
    };
}
