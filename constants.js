// constants.js - 2026 Federal (OBBBA) & Michigan Data
export const TAX_CONSTANTS = {
    YEAR: 2026,
    STANDARD_DEDUCTION: {
        SINGLE: 16100,
        MFJ: 32200
    },
    BRACKETS: {
        SINGLE: [
            { min: 0, max: 12400, rate: 0.10 },
            { min: 12401, max: 50400, rate: 0.12 },
            { min: 50401, max: 105700, rate: 0.22 },
            { min: 105701, max: 201775, rate: 0.24 },
            { min: 201776, max: 256225, rate: 0.32 },
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
    CTC: {
        MAX_PER_CHILD: 2200, // OBBBA Permanent increase
        PHASE_OUT_START: { SINGLE: 200000, MFJ: 400000 }
    },
    SALT_CAP: 40000 // OBBBA increased from $10k to $40k
};

export const MICHIGAN_PROGRAMS = {
    SNAP_GROSS_MONTHLY_LIMIT: {
        1: 2610, 2: 3526, 3: 4442, 4: 5360, 5: 6276, 6: 7192, 7: 8110, 8: 9026
    },
    MEDICAID_ADULT_MONTHLY: { 1: 1799, 2: 2432, 3: 3064, 4: 3697, 5: 4329, 6: 4962 },
    MEDICAID_KIDS_MONTHLY: { 1: 2831, 2: 3825, 3: 4819, 4: 5813, 5: 6807, 6: 7801 }
};