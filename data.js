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
        // Save this initial data to Firebase immediately
        await autoSave(false); // Don't re-scrape UI on first save
    }
    
    loadUserDataIntoUI(window.currentData);
}

export function loadUserDataIntoUI(data) {
    console.log("Populating UI with user data...");

    // Clear existing dynamic content to prevent duplication
    clearDynamicContent();

    // Populate Investments
    data.investments?.forEach(item => window.addRow('investment-rows', 'investment', item));
    data.helocs?.forEach(item => window.addRow('heloc-rows', 'heloc', item));
    data.debts?.forEach(item => window.addRow('debt-rows', 'debt', item));
    data.income?.forEach(item => window.addRow('income-rows', 'income', item));
    data.savings?.forEach(item => window.addRow('savings-list', 'savings-item', item));
    data.budget?.forEach(item => window.addRow('budget-rows', 'budget-item', item));
    
    // Populate Assumptions
    const assumptionsContainer = document.getElementById('assumptions-container');
    if (data.assumptions && assumptionsContainer) {
        Object.keys(data.assumptions).forEach(key => {
            const input = assumptionsContainer.querySelector(`[data-id="${key}"]`);
            if (input) input.value = data.assumptions[key];
        });
    }
    
    window.updateCostBasisHeaderVisibility();
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
}

export async function autoSave(scrape = true) {
    if (scrape) {
        window.currentData = scrapeDataFromUI();
    }

    updateSummaries(window.currentData);

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
        helocs: [], 
        debts: [], 
        income: [], 
        savings: [], 
        budget: [] 
    };

    // Scrape Assumptions
    document.querySelectorAll('#assumptions-container [data-id]').forEach(input => {
        data.assumptions[input.dataset.id] = input.value;
    });

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
        if (input.type === 'checkbox') {
            rowData[input.dataset.id] = input.checked;
        } else if (input.dataset.type === 'currency') {
            rowData[input.dataset.id] = math.fromCurrency(input.value);
        } else {
            rowData[input.dataset.id] = input.value;
        }
    });
    return rowData;
}

function getInitialData() {
    return { 
        assumptions: assumptions.defaults,
        investments: [],
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

// We need to re-export this so it can be used in core.js
export function updateSummaries(data) {
    if (!data) return;

    const summaries = engine.calculateSummaries(data);

    // Sidebar & Main Summary
    const sidebarNetworth = document.getElementById('sidebar-networth');
    const sumAssets = document.getElementById('sum-assets');
    const sumLiabilities = document.getElementById('sum-liabilities');
    const sumIncome = document.getElementById('sum-income-summary');
    const sumSavings = document.getElementById('sum-total-savings-summary');

    if (sidebarNetworth) sidebarNetworth.textContent = math.toCurrency(summaries.netWorth, false);
    if (sumAssets) sumAssets.textContent = math.toCurrency(summaries.totalAssets, false);
    if (sumLiabilities) sumLiabilities.textContent = math.toCurrency(summaries.totalLiabilities, false);
    if (sumIncome) sumIncome.textContent = `${math.toCurrency(summaries.grossIncome, false)}/yr`;
    if (sumSavings) sumSavings.textContent = `${math.toCurrency(summaries.totalAnnualSavings, false)}/yr`;
}