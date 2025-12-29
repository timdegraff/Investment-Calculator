// constants.js - 2026 Comprehensive Data
export const TAX_CONSTANTS = {
    YEAR: 2026,
    STANDARD_DEDUCTION: {
        SINGLE: 16100,
        MFJ: 32200,
        HOH: 24150 // Head of Household
    },
    // 2026 Income Tax Brackets
    BRACKETS: {
        SINGLE: [
            { min: 0, max: 12400, rate: 0.10 },
            { min: 12401, max: 50400, rate: 0.12 },
            { min: 50401, max: 105700, rate: 0.22 },
            { min: 105701, max: 211400, rate: 0.24 },
            { min: 211401, max: 256225, rate: 0.32 },
            { min: 256226, max: 640600, rate: 0.35 },
            { min: 640601, max: Infinity, rate: 0.37 }
        ],
        MFJ: [
            { min: 0, max: 24800, rate: 0.10 },
            { min: 24801, max: 100800, rate: 0.12 },
            { min: 100801, max: 211400, rate: 0.22 },
            { min: 211401, max: 403550, rate: 0.24 },
            { min: 403551, max: 512450, rate: 0.32 },
            { min: 512451, max: 768700, rate: 0.35 },
            { min: 768701, max: Infinity, rate: 0.37 }
        ]
    },
    // Child Tax Credit (CTC) 2026
    CTC: {
        MAX_PER_CHILD: 2200,
        MAX_REFUNDABLE: 1700,
        PHASE_OUT_START: { SINGLE: 200000, MFJ: 400000 },
        PHASE_OUT_RATE: 0.05, // $50 for every $1000 over
        OTHER_DEPENDENT_CREDIT: 500
    }
};

export const SOCIAL_PROGRAMS = {
    // SNAP 130% Gross Monthly Income Limits (Continental US 2026)
    SNAP_GROSS_MONTHLY: {
        1: 1696, 2: 2292, 3: 2888, 4: 3483,
        5: 4079, 6: 4675, 7: 5271, 8: 5867,
        EACH_ADDITIONAL: 596
    },
    SNAP_MAX_ALLOTMENT: {
        1: 298, 2: 546, 3: 785, 4: 994,
        5: 1183, 6: 1421, 7: 1571, 8: 1789,
        EACH_ADDITIONAL: 218
    }
};