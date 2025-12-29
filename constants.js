// constants.js - 2026 Data & Financial Rules
export const TAX_CONSTANTS = {
    YEAR: 2026,
    STANDARD_DEDUCTION_MFJ: 32200, // Up from $31,500 in 2025
    ADDITIONAL_65_PLUS_MFJ: 1650,  // Per spouse over 65
    
    // 2026 MFJ Tax Brackets
    BRACKETS_MFJ: [
        { min: 0, max: 24800, rate: 0.10 },
        { min: 24801, max: 100800, rate: 0.12 },
        { min: 100801, max: 211400, rate: 0.22 },
        { min: 211401, max: 403550, rate: 0.24 },
        { min: 403551, max: 512450, rate: 0.32 },
        { min: 512451, max: 768700, rate: 0.35 },
        { min: 768701, max: Infinity, rate: 0.37 }
    ],
    
    // Retirement Contribution Limits 2026
    LIMIT_401K: 24500,     // Up from $23,500
    LIMIT_IRA: 7500,       // Up from $7,000
    CATCH_UP_50_PLUS: 8000 // Total 401k for age 50+ is $32,500
};

export const SOCIAL_PROGRAMS = {
    // SNAP FY2026 (Effective Oct 2025 - Sept 2026)
    SNAP_MAX_ALLOTMENT_FAMILY_6: 1421, // Family of 6
    SNAP_GROSS_INCOME_LIMIT_MFJ_6: 4675, // 130% FPL for Family of 6
    SNAP_ASSET_LIMIT: 3000,              // Standard (House/Retirement usually exempt)
};

export const RETIREMENT_RULES = {
    AGE_72T_PENALTY_FREE: 59.5,
    SEPP_INTEREST_RATE_MAX: 0.05, // Greater of 5% or 120% AFR
    PENALTY_EARLY_WITHDRAW: 0.10,
    // User Preferences
    SAFE_WITHDRAWAL_EARLY: 0.07, 
    SAFE_WITHDRAWAL_STD: 0.05
};