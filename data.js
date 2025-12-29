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
    const status = data.filingStatus || 'MFJ';
    const familySize = (parseInt(data.kidsCount) || 0) + 2;
    const annualGross = (parseFloat(data.monthlyIncome) || 0) * 12;

    // 1. Calculations
    const netWorth = calculateNetWorth(data.assets, data.liabilities);
    const estTax = calculateEstimatedTax(annualGross, status);
    const ctc = calculateCTC(annualGross, data.kidsCount, status);
    const benefits = checkMichiganBenefits(data.monthlyIncome, familySize);

    // 2. UI Updates
    document.getElementById('total-net-worth').innerText = `$${netWorth.toLocaleString()}`;
    document.getElementById('tax-display').innerText = `$${estTax.toLocaleString()}`;
    document.getElementById('ctc-display').innerText = `$${ctc.toLocaleString()}`;
    document.getElementById('snap-limit-display').innerText = `$${benefits.snapLimit.toLocaleString()}`;

    // 3. Visual Feedback for SNAP
    const snapLabel = document.getElementById('snap-limit-display');
    snapLabel.className = benefits.snapEligible ? "font-bold text-green-600" : "font-bold text-gray-700";
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