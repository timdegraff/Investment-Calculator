/**
 * MATH.JS - Core Calculation Engine
 * Updated for 2026 MFJ Sunsetting Logic & $2,200 CTC
 */

const engine = {
    // 1. Core Net Worth
    calculateNetWorth: (assets, liabilities) => {
        const totalAssets = assets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0);
        const totalDebt = liabilities.reduce((sum, l) => sum + (parseFloat(l.balance) || 0), 0);
        return totalAssets - totalDebt;
    },

    // 2. 2026 Federal Child Tax Credit (CTC) - Updated to $2,200
    calculateCTC: (agi, childrenCount = 4) => {
        const config = TAX_CONSTANTS.CTC;
        const maxPerChild = 2200; 
        const threshold = config.PHASE_OUT_START_MFJ;
        let totalCredit = childrenCount * maxPerChild;
        
        // Phase-out: $50 reduction per $1,000 over threshold
        if (agi > threshold) {
            const excess = Math.ceil((agi - threshold) / 1000);
            totalCredit = Math.max(0, totalCredit - (excess * 50));
        }
        return totalCredit;
    },

    // 3. Federal Income Tax (MFJ)
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
        
        // Apply the $2,200 per child credit to the final bill
        const totalCredit = engine.calculateCTC(grossTaxable, 4);
        return Math.max(0, tax - totalCredit);
    },

    // 4. Michigan Benefit Eligibility Check
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

    // 5. SALT vs Standard Deduction
    calculateBestDeduction: (annualIncome, propertyTax) => {
        const miTax = annualIncome * TAX_CONSTANTS.MI_STATE_TAX_RATE;
        const totalSALT = Math.min(miTax + propertyTax, TAX_CONSTANTS.SALT_CAP);
        const standard = TAX_CONSTANTS.STANDARD_DEDUCTION.MFJ;
        
        return {
            amount: Math.max(standard, totalSALT),
            isItemizing: totalSALT > standard
        };
    },

    // 6. 401k Math for GM Scenario
    calculate401kContribution: (base, bonusPct, contribPct, matchPct, includeBonus) => {
        const bonus = base * (bonusPct / 100);
        const totalIncome = base + bonus;
        
        const effectiveBasis = includeBonus ? totalIncome : base;
        const personal = effectiveBasis * (contribPct / 100);
        const employer = effectiveBasis * (matchPct / 100);
        
        return personal + employer;
    }
};