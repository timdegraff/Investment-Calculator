import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { calculateNetWorth, calculateCTC, calculateEstimatedTax, checkSnapEligibility } from './math.js';

const db = getFirestore();
let saveTimeout = null;

/**
 * Scrapes the UI and pushes data to Firebase
 */
export function triggerAutoSave(userId) {
    const statusEl = document.getElementById('save-status');
    if (statusEl) statusEl.innerText = "Syncing...";

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        const data = {
            filingStatus: document.getElementById('filing-status')?.value || 'MFJ',
            kidsCount: parseInt(document.getElementById('kids-count')?.value) || 0,
            monthlyIncome: parseFloat(document.getElementById('monthly-income')?.value) || 0,
            assets: Array.from(document.querySelectorAll('[data-type="asset-val"]')).map(input => ({
                name: input.dataset.name,
                value: input.value
            })),
            liabilities: Array.from(document.querySelectorAll('#liabilities-list > div')).map(div => ({
                name: div.querySelector('.text-sm')?.innerText,
                balance: div.querySelector('[data-type="balance"]')?.value
            })),
            lastUpdated: new Date()
        };

        try {
            await setDoc(doc(db, "users", userId), data);
            if (statusEl) statusEl.innerText = "Synced";
            updateUIResults(data);
        } catch (e) {
            if (statusEl) statusEl.innerText = "Error";
            console.error("Save failed:", e);
        }
    }, 1500);
}

/**
 * Updates the Dashboard numbers using math.js
 */
function updateUIResults(data) {
    const netWorth = calculateNetWorth(data.assets, data.liabilities);
    const status = data.filingStatus || 'MFJ'; // Default to MFJ
    const tax = calculateEstimatedTax(data.monthlyIncome * 12, status);
    const ctc = calculateCTC(data.monthlyIncome * 12, data.kidsCount, status);
    // Calculate SNAP for family size (Kids + 2 Adults)
    const snap = checkSnapEligibility(data.monthlyIncome, data.kidsCount + 2);

    // Calculate Federal Tax
    const annualGross = (parseFloat(data.monthlyIncome) || 0) * 12;
    const estimatedTax = calculateEstimatedTax(annualGross, status);

    // Update UI
    document.getElementById('tax-display').innerText = `-$${estimatedTax.toLocaleString()}/yr`;

    // Update UI
    document.getElementById('total-net-worth').innerText = `$${netWorth.toLocaleString()}`;
    document.getElementById('ctc-display').innerText = `$${ctc.toLocaleString()}/yr`;
    document.getElementById('snap-limit-display').innerText = `$${snap.limit.toLocaleString()}/mo`;
}

/**
 * Loads user data on login
 */
export async function loadUserData(userId, callback) {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
        callback(docSnap.data());
    }
}