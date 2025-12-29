import { TAX_CONSTANTS, SOCIAL_PROGRAMS, RETIREMENT_RULES } from './constants.js';

/**
 * Calculates total Net Worth
 */
export function calculateNetWorth(assets, liabilities) {
    const totalAssets = assets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0);
    const totalDebt = liabilities.reduce((sum, l) => sum + (parseFloat(l.balance) || 0), 0);
    return totalAssets - totalDebt;
}

/**
 * Calculates Child Tax Credit with 2026 phase-out rules
 */
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

/**
 * Estimates Federal Income Tax based on 2026 brackets
 */
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

/**
 * Checks monthly SNAP eligibility for a family of 6 (or user-defined size)
 */
export function checkSnapEligibility(monthlyGrossIncome, familySize) {
    const limit = SOCIAL_PROGRAMS.SNAP_GROSS_MONTHLY[familySize] || 
                  (SOCIAL_PROGRAMS.SNAP_GROSS_MONTHLY[8] + (familySize - 8) * SOCIAL_PROGRAMS.SNAP_GROSS_MONTHLY.EACH_ADDITIONAL);
    return {
        eligible: monthlyGrossIncome <= limit,
        limit: limit
    };
}