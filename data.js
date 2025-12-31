
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { assumptions, math, engine } from './utils.js';

let db;
let user;

export async function initializeData(authUser) {
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js");
    const { auth } = await import("./auth.js");

    db = getFirestore();
    user = authUser;
    return loadData();
}

async function loadData() {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && Object.keys(docSnap.data()).length > 0) {
        console.log("Found user data, loading...");
        window.currentData = docSnap.data();
    } else {
        console.log("No data found for user, initializing with default data.");
        window.currentData = getInitialData();
        await autoSave(false);
    }
    
    loadUserDataIntoUI(window.currentData);
}

export function loadUserDataIntoUI(data) {
    console.log("Populating UI with user data...");
    clearDynamicContent();

    // Populate Real Estate
    if (data.realEstate) {
        fillRow(document.getElementById('real-estate-card'), data.realEstate);
    }

    // Populate data tables
    data.investments?.forEach(item => window.addRow('investment-rows', 'investment', item));
    data.helocs?.forEach(item => window.addRow('heloc-rows', 'heloc', item));
    data.debts?.forEach(item => window.addRow('debt-rows', 'debt', item));
    data.income?.forEach(item => window.addRow('income-rows', 'income', item));
    data.savings?.forEach(item => window.addRow('savings-list', 'savings-item', item));
    data.budget?.forEach(item => window.addRow('budget-rows', 'budget-item', item));
    
    // Create and populate the assumption controls
    if (data.assumptions) {
        window.createAssumptionControls(data);
    }
    
    updateSummaries(data);
    console.log("UI Population complete.");
}

function clearDynamicContent() {
    document.getElementById('investment-rows').innerHTML = '';
    document.getElementById('heloc-rows').innerHTML = '';
    document.getElementById('debt-rows').innerHTML = '';
    document.getElementById('income-rows').innerHTML = '';
    document.getElementById('savings-list').innerHTML = '';
    document.getElementById('budget-rows').innerHTML = '';
    // Also clear real estate
    document.getElementById('real-estate-card').querySelectorAll('input').forEach(input => input.value = '');
}

export async function autoSave(scrape = true) {
    if (scrape) {
        window.currentData = scrapeDataFromUI();
    }

    updateSummaries(window.currentData);

    // Re-run projection if the projection tab is currently active
    const projectionTab = document.getElementById('tab-projection');
    if (projectionTab && !projectionTab.classList.contains('hidden')) {
        engine.runProjection(window.currentData);
    }

    if (user && db) {
        const docRef = doc(db, "users", user.uid);
        try {
            await setDoc(docRef, window.currentData, { merge: true });
            console.log("Data saved to Firestore.");
        } catch (error) {
            console.error("Error saving data to Firestore:", error);
        }
    }
};

function scrapeDataFromUI() {
    const data = { 
        assumptions: {}, 
        investments: [], 
        realEstate: {}, // New object for real estate
        helocs: [], 
        debts: [], 
        income: [], 
        savings: [], 
        budget: [] 
    };

    // Scrape Assumptions
    document.querySelectorAll('#assumptions-container [data-id]').forEach(input => {
        data.assumptions[input.dataset.id] = parseFloat(input.value);
    });

    // Scrape Real Estate
    data.realEstate = scrapeRow(document.getElementById('real-estate-card'));

    // Scrape Investments, HELOCs, Debts, etc.
    document.querySelectorAll('#investment-rows tr').forEach(row => data.investments.push(scrapeRow(row)));
    document.querySelectorAll('#heloc-rows tr').forEach(row => data.helocs.push(scrapeRow(row)));
    document.querySelectorAll('#debt-rows tr').forEach(row => data.debts.push(scrapeRow(row)));
    document.querySelectorAll('#income-rows .income-card').forEach(card => data.income.push(scrapeRow(card)));
    document.querySelectorAll('#savings-list tr').forEach(row => data.savings.push(scrapeRow(row)));
    document.querySelectorAll('#budget-rows tr').forEach(row => data.budget.push(scrapeRow(row)));

    return data;
}

function scrapeRow(row) {
    const rowData = {};
    row.querySelectorAll('[data-id]').forEach(input => {
        const key = input.dataset.id;
        if (input.type === 'checkbox') {
            rowData[key] = input.checked;
        } else if (input.dataset.type === 'currency') {
            rowData[key] = math.fromCurrency(input.value);
        } else if (input.type === 'number' || input.type === 'range') {
            rowData[key] = parseFloat(input.value) || 0;
        } else {
            rowData[key] = input.value;
        }
    });
    return rowData;
}

function getInitialData() {
    return { 
        assumptions: assumptions.defaults,
        investments: [],
        realEstate: { value: 500000, mortgage: 250000 },
        helocs: [],
        debts: [],
        income: [],
        savings: [],
        budget: [
            { name: "Housing", monthly: 2000, annual: 24000 },
            { name: "Groceries", monthly: 500, annual: 6000 },
            { name: "Utilities", monthly: 300, annual: 3600 },
            { name: "Transportation", monthly: 400, annual: 4800 },
            { name: "Fun Money", monthly: 300, annual: 3600 },
            { name: "Health Insurance", monthly: 0, annual: 8400 },
        ],
    };
}

export function updateSummaries(data) {
    if (!data) return;

    const summaries = engine.calculateSummaries(data);

    // Sidebar Networth
    const sidebarNetworth = document.getElementById('sidebar-networth');
    if (sidebarNetworth) sidebarNetworth.textContent = math.toCurrency(summaries.netWorth, false);

}

// This is now a global function
window.fillRow = (row, data) => {
    Object.keys(data).forEach(key => {
        const input = row.querySelector(`[data-id="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = data[key];
            } else if (input.dataset.type === 'currency') {
                // Format currency for display
                input.value = math.toCurrency(data[key], true);
            } else {
                input.value = data[key];
            }
            // Dispatch events to ensure other listeners update
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
};