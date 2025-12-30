// constants.js - 2026 Projections (TCJA Sunsets & Michigan Rates)
const TAX_CONSTANTS = {
    YEAR: 2026,
    STANDARD_DEDUCTION: { 
        SINGLE: 16100, 
        MFJ: 32200 
    },
    BRACKETS: {
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
        MAX_PER_CHILD: 2200, 
        PHASE_OUT_START_MFJ: 400000 
    },
    MI_STATE_TAX_RATE: 0.0425,
    SALT_CAP: 40400 // Projected 2026 SALT cap for MFJ
};

const MICHIGAN_PROGRAMS = {
    SNAP_MONTHLY_LIMIT: { 1: 2610, 2: 3526, 3: 4442, 4: 5360, 5: 6276, 6: 7192, 7: 8110, 8: 9026 },
    MEDICAID_ADULT_MONTHLY: { 1: 1799, 2: 2432, 3: 3064, 4: 3697, 5: 4329, 6: 4962 },
    MEDICAID_KIDS_MONTHLY: { 1: 2831, 2: 3825, 3: 4819, 4: 5813, 5: 6807, 6: 7801 }
};