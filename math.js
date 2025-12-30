const math = {
    toCurrency: (value, addSign = false) => {
        if (isNaN(value)) return "$0";

        const absValue = Math.abs(value);
        let formatted;

        if (absValue >= 1000000) {
            formatted = '$' + (absValue / 1000000).toFixed(1) + 'M';
        } else if (absValue >= 1000) {
            formatted = '$' + Math.round(absValue / 1000) + 'K';
        } else {
            formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(absValue);
        }

        if (addSign) {
            return value < 0 ? `-${formatted}` : `+${formatted}`;
        }
        return value < 0 ? `-${formatted}` : formatted;
    },

    getSliderValue: (id) => {
        const slider = document.getElementById(id);
        return slider ? parseFloat(slider.value) : 0;
    },

    /**
     * Calculates the estimated federal income tax based on a progressive tax bracket system.
     * This is a simplified model for 2024, single filers.
     * Does not account for deductions, credits, or state taxes.
     */
    calculateProgressiveTax: (income) => {
        const brackets = {
            // Rate: [start, end]
            0.10: [0, 11600],
            0.12: [11601, 47150],
            0.22: [47151, 100525],
            0.24: [100526, 191950],
            0.32: [191951, 243725],
            0.35: [243726, 609350],
            0.37: [609351, Infinity],
        };

        let totalTax = 0;
        if (income > brackets[0.37][0]) totalTax += (income - brackets[0.37][0]) * 0.37;
        if (income > brackets[0.35][0]) totalTax += (Math.min(income, brackets[0.35][1]) - brackets[0.35][0]) * 0.35;
        if (income > brackets[0.32][0]) totalTax += (Math.min(income, brackets[0.32][1]) - brackets[0.32][0]) * 0.32;
        if (income > brackets[0.24][0]) totalTax += (Math.min(income, brackets[0.24][1]) - brackets[0.24][0]) * 0.24;
        if (income > brackets[0.22][0]) totalTax += (Math.min(income, brackets[0.22][1]) - brackets[0.22][0]) * 0.22;
        if (income > brackets[0.12][0]) totalTax += (Math.min(income, brackets[0.12][1]) - brackets[0.12][0]) * 0.12;
        if (income > brackets[0.10][0]) totalTax += (Math.min(income, brackets[0.10][1]) - brackets[0.10][0]) * 0.10;

        return totalTax;
    }
};