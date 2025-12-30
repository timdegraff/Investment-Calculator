/**
 * MATH.JS - Core Calculation Engine
 * Preserves 2026 Sunset Logic, MI Benefits, and Adds Asset-Class Growth
 */

const engine = {
    // 1. New: Growth Rate Mapper (Ensures HSA/Roth/529 grow as stocks)
    getGrowthRate: (assetClass, data) => {
        const stockClasses = [
            "Taxable", 
            "Pre-Tax (401k/IRA)", 
            "Post-Tax (Roth)", 
            "HSA", 
            "529 Plan", 
            "Crypto",
            "Taxable (Brokerage)" // Catch-all for savings table variant
        ];
        
        if (stockClasses.includes(assetClass)) {
            return parseFloat(data.stockGrowth) || 7;
        } else if (assetClass === "Cash/Physical") {
            return 0.5; // Fixed HYSA/Cash estimate
        } else {
            return parseFloat(data.inflation) || 3; // Metals/Default/Physical
        }
    },

    // 2. New: Scraper Tool (Centralized for data.js to use)
    getTableData: (selector, fields) => {
        return Array.from(document.querySelectorAll(selector)).map(tr => {
            const row = {};
            const inputs = tr.querySelectorAll('input, select');
            fields.forEach((field, i) => {
                if (inputs[i]) {
                    row[field] = inputs[i].type === 'number' ? parseFloat(inputs[i].value) || 0 : inputs[i].value;
                }
            });
            return row;
        });
    },

    // 3. Core Net Worth
    calculateNetWorth: (assets, liabilities) => {
        const totalAssets = assets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0);
        const totalDebt = liabilities.reduce((sum, l) => sum + (parseFloat(l.balance) || 0), 0);
        return totalAssets - totalDebt;
    },

    // 4. 2026 Federal Child Tax Credit (CTC)
    calculateCTC: (agi, childrenCount = 4) => {
        const config = TAX_CONSTANTS.CTC;
        const maxPerChild = config.MAX_PER_CHILD || 2200; 
        const threshold = config.PHASE_OUT_START_MFJ;
        let totalCredit = childrenCount * maxPerChild;
        
        if (agi > threshold) {
            const excess = Math.ceil((agi - threshold) / 1000);
            totalCredit = Math.max(0, totalCredit - (excess * 50));
        }
        return totalCredit;
    },

    // 5. Federal Income Tax (MFJ)
    calculateFederalTax: (grossTaxable) => {
        const standardDed = TAX_CONSTANTS.STANDARD_DEDUCTION.MFJ;
        const income = Math.max(0, grossTaxable - standardDed);
        const brackets = TAX_CONSTANTS.BRACKETS.MFJ;
        let tax = 0;

        for (const bracket of brackets) {
            if (income > bracket.min) {
                const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
                tax += taxableInBracket * bracket.rate;
            } else break;
        }
        
        const totalCredit = engine.calculateCTC(grossTaxable, 4);
        return Math.max(0, tax - totalCredit);
    },

    // 6. Michigan Benefit Eligibility Check
    checkMichiganBenefits: (monthlyIncome, familySize = 6) => {
        const snapLimit = MICHIGAN_PROGRAMS.SNAP_MONTHLY_LIMIT[familySize] || 0;
        const medicaidAdultLimit = MICHIGAN_PROGRAMS.MEDICAID_ADULT_MONTHLY[familySize] || 0;
        const medicaidKidsLimit = MICHIGAN_PROGRAMS.MEDICAID_KIDS_MONTHLY[familySize] || 0;

        return {
            snapEligible: monthlyIncome <= snapLimit,
            medicaidAdultsEligible: monthlyIncome <= medicaidAdultLimit,
            medicaidKidsEligible: monthlyIncome <= medicaidKidsLimit
        };
    },

    // 7. SALT vs Standard Deduction
    calculateBestDeduction: (annualIncome, propertyTax) => {
        const miTax = annualIncome * TAX_CONSTANTS.MI_STATE_TAX_RATE;
        const totalSALT = Math.min(miTax + propertyTax, TAX_CONSTANTS.SALT_CAP);
        const standard = TAX_CONSTANTS.STANDARD_DEDUCTION.MFJ;
        
        return {
            amount: Math.max(standard, totalSALT),
            isItemizing: totalSALT > standard
        };
    },

    // 8. 401k Math for GM Scenario
    calculate401kContribution: (base, bonusPct, contribPct, matchPct, includeBonus) => {
        const bonus = base * (bonusPct / 100);
        const totalIncome = base + bonus;
        const effectiveBasis = includeBonus ? totalIncome : base;
        return (effectiveBasis * (contribPct / 100)) + (effectiveBasis * (matchPct / 100));
    },

    // 9. Dynamic Age Update
    updateAgeDisplay: async (saveToCloud = false) => {
        const birthYearInput = document.getElementById('user-birth-year');
        const displayAge = document.getElementById('display-age');
        if (!birthYearInput || !displayAge) return;

        const birthYear = parseInt(birthYearInput.value);
        const targetYear = 2026;

        if (birthYear && birthYear > 1900 && birthYear <= targetYear) {
            displayAge.innerText = `${targetYear - birthYear} YRS OLD (IN 2026)`;
            if (saveToCloud && window.autoSave) window.autoSave();
        } else {
            displayAge.innerText = `-- YRS OLD`;
        }
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const birthYearInput = document.getElementById('user-birth-year');
    if (birthYearInput) {
        birthYearInput.addEventListener('input', () => engine.updateAgeDisplay(true));
        engine.updateAgeDisplay(); 
    }
});