
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { assumptions, math, engine } from './utils.js';
import { formatter } from './formatter.js';

let db;
let user;

export async function initializeData(authUser) {
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
        console.log("No data found, initializing with defaults.");
        window.currentData = getInitialData();
        await autoSave(false); // Do an initial save without scraping
    }
    
    loadUserDataIntoUI(window.currentData);
}

export function loadUserDataIntoUI(data) {
    console.log("Populating UI with data:", data);
    clearDynamicContent();

    const populateOrAddBlank = (dataArray, containerId, rowType) => {
        const items = dataArray || [];
        if (items.length > 0) {
            items.forEach(item => window.addRow(containerId, rowType, item));
        } else {
            window.addRow(containerId, rowType, {}); // Add a single blank row
        }
    };

    populateOrAddBlank(data.investments, 'investment-rows', 'investment');
    populateOrAddBlank(data.realEstate, 'real-estate-rows', 'realEstate');
    populateOrAddBlank(data.helocs, 'heloc-rows', 'heloc');
    populateOrAddBlank(data.debts, 'debt-rows', 'debt');
    populateOrAddBlank(data.income, 'income-rows', 'income');
    populateOrAddBlank(data.budget?.savings, 'budget-savings-rows', 'budget-savings');
    populateOrAddBlank(data.budget?.expenses, 'budget-expenses-rows', 'budget-expense');

    if (data.assumptions) {
        window.createAssumptionControls(data);
    }

    updateSummaries(data);
    console.log("UI Population complete.");
}

function clearDynamicContent() {
    ['investment-rows', 'real-estate-rows', 'heloc-rows', 'debt-rows', 'income-rows', 'budget-savings-rows', 'budget-expenses-rows'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
}

export async function autoSave(scrape = true) {
    if (scrape) {
        window.currentData = scrapeDataFromUI();
    }

    updateSummaries(window.currentData);

    const projectionTab = document.getElementById('tab-projection');
    if (projectionTab && !projectionTab.classList.contains('hidden')) {
        engine.runProjection(window.currentData);
    }

    if (user && db) {
        try {
            await setDoc(doc(db, "users", user.uid), window.currentData, { merge: true });
            console.log("Data saved to Firestore.");
        } catch (error) {
            console.error("Error saving data:", error);
        }
    }
};

function scrapeDataFromUI() {
    const data = { 
        assumptions: {}, 
        investments: [], 
        realEstate: [],
        helocs: [], 
        debts: [], 
        income: [], 
        budget: { savings: [], expenses: [] } 
    };

    document.querySelectorAll('#assumptions-container [data-id]').forEach(input => {
        data.assumptions[input.dataset.id] = parseFloat(input.value);
    });

    document.querySelectorAll('#investment-rows tr').forEach(row => data.investments.push(scrapeRow(row)));
    document.querySelectorAll('#real-estate-rows tr').forEach(row => data.realEstate.push(scrapeRow(row)));
    document.querySelectorAll('#heloc-rows tr').forEach(row => data.helocs.push(scrapeRow(row)));
    document.querySelectorAll('#debt-rows tr').forEach(row => data.debts.push(scrapeRow(row)));
    document.querySelectorAll('#income-rows .income-card').forEach(card => data.income.push(scrapeRow(card)));
    document.querySelectorAll('#budget-savings-rows tr').forEach(row => data.budget.savings.push(scrapeRow(row)));
    document.querySelectorAll('#budget-expenses-rows tr').forEach(row => data.budget.expenses.push(scrapeRow(row)));

    return data;
}

function scrapeRow(row) {
    const rowData = {};
    row.querySelectorAll('[data-id]').forEach(input => {
        const key = input.dataset.id;
        const val = input.value;
        if (input.type === 'checkbox') {
            rowData[key] = input.checked;
        } else if (input.dataset.type === 'currency') {
            rowData[key] = math.fromCurrency(val);
        } else if (input.type === 'number' || input.type === 'range') {
            rowData[key] = parseFloat(val) || 0;
        } else {
            rowData[key] = val;
        }
    });
    return rowData;
}

function getInitialData() {
    return { 
        assumptions: assumptions.defaults,
        investments: [],
        realEstate: [],
        helocs: [],
        debts: [],
        income: [],
        budget: {
            savings: [],
            expenses: []
        }
    };
}

export function updateSummaries(data) {
    if (!data) return;

    const summaries = engine.calculateSummaries(data);

    const updateText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = formatter.formatCurrency(value);
    };

    updateText('sidebar-networth', summaries.netWorth);

    updateText('sum-assets', summaries.totalAssets);
    updateText('sum-liabilities', summaries.totalLiabilities);
    updateText('sum-networth', summaries.netWorth);

    updateText('sum-income', summaries.grossIncome);

    updateText('sum-budget-savings', summaries.totalAnnualSavings);
    updateText('sum-budget-annual', summaries.totalAnnualBudget);
    updateText('sum-budget-total', summaries.totalAnnualSavings + summaries.totalAnnualBudget);
}
