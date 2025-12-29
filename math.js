import { TAX_CONSTANTS, MICHIGAN_PROGRAMS } from './constants.js';

export function calculateNetWorth(assets, liabilities) {
    const totalAssets = assets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0);
    const totalDebt = liabilities.reduce((sum, l) => sum + (parseFloat(l.balance) || 0), 0);
    return totalAssets - totalDebt;
}

export function calculateCTC(agi, childrenCount, filingStatus) {
    const config = TAX_CONSTANTS.CTC;
    const threshold = config.PHASE_OUT_START[filingStatus] || config.PHASE_OUT_START.SINGLE;
    let totalCredit = childrenCount * config.MAX_PER_CHILD;
    if (agi > threshold) {
        const excess = Math.ceil((agi - threshold) / 1000);
        totalCredit = Math.max(0, totalCredit - (excess * 50));
    }
    return totalCredit;
}

export function calculateEstimatedTax(taxableIncome, filingStatus) {
    let tax = 0;
    const standardDed = TAX_CONSTANTS.STANDARD_DEDUCTION[filingStatus] || TAX_CONSTANTS.STANDARD_DEDUCTION.SINGLE;
    const income = Math.max(0, taxableIncome - standardDed);
    const brackets = TAX_CONSTANTS.BRACKETS[filingStatus] || TAX_CONSTANTS.BRACKETS.SINGLE;
    for (const bracket of brackets) {
        if (income > bracket.min) {
            const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
            tax += taxableInBracket * bracket.rate;
        } else break;
    }
    return tax;
}

export function checkMichiganBenefits(monthlyIncome, familySize) {
    const snapLimit = MICHIGAN_PROGRAMS.SNAP_GROSS_MONTHLY_LIMIT[familySize] || 0;
    const medicaidAdultLimit = MICHIGAN_PROGRAMS.MEDICAID_ADULT_MONTHLY[familySize] || 0;
    const medicaidKidsLimit = MICHIGAN_PROGRAMS.MEDICAID_KIDS_MONTHLY[familySize] || 0;
    return {
        snapEligible: monthlyIncome <= snapLimit,
        snapLimit: snapLimit,
        medicaidAdultsEligible: monthlyIncome <= medicaidAdultLimit,
        medicaidKidsEligible: monthlyIncome <= medicaidKidsLimit
    };
}

export function calculateBestDeduction(annualIncome, propertyTax, filingStatus) {
    const miTax = annualIncome * TAX_CONSTANTS.MI_STATE_TAX_RATE;
    const totalSALT = Math.min(miTax + propertyTax, TAX_CONSTANTS.SALT_CAP);
    const standard = TAX_CONSTANTS.STANDARD_DEDUCTION[filingStatus];
    
    return {
        amount: Math.max(standard, totalSALT),
        isItemizing: totalSALT > standard
    };
}