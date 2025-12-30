const engine = {
    // 1. High-Precision Formatting
    formatCompact: (val) => {
        if (val === undefined || isNaN(val)) return "$0";
        const abs = Math.round(Math.abs(val));
        const sign = val < 0 ? "-" : "";
        if (abs >= 1000000) return sign + "$" + (abs / 1000000).toFixed(2) + "M";
        if (abs >= 1000) return sign + "$" + (abs / 1000).toFixed(1) + "K";
        return sign + "$" + abs;
    },

    // 2. 2026 MFJ Tax Logic (with 4-child tax credit)
    calculateTaxes: (grossTaxable) => {
        const standardDeduction = 30000;
        const taxable = Math.max(0, grossTaxable - standardDeduction);
        let tax = 0;
        // 2026 Estimated MFJ Brackets
        if (taxable <= 23200) tax = taxable * 0.10;
        else if (taxable <= 94300) tax = 2320 + (taxable - 23200) * 0.12;
        else if (taxable <= 201050) tax = 10852 + (taxable - 94300) * 0.22;
        else tax = 34337 + (taxable - 201050) * 0.24;
        
        // Subtract $2,000 per child (Evan, Colin, Emma, Hannah)
        return Math.max(0, tax - 8000); 
    },

    // 3. Core Projection Logic (Asset Growth & Drawdowns)
    runProjection: (data) => {
        const startAge = new Date().getFullYear() - (data.birthYear || 1986);
        const retAge = data.retAge || 55;
        const stockG = 1 + (data.stockGrowth / 100);
        const reG = 1 + (data.reAppreciation / 100);
        const inflG = 1 + (data.inflation / 100);

        let cStock = data.investments.reduce((a, b) => a + Number(b.balance || 0), 0);
        let cRE = data.realEstate.reduce((a, b) => a + Number(b.value || 0), 0);
        let cDebt = (data.realEstate.reduce((a, b) => a + Number(b.mortgage || 0), 0)) +
                    (data.debts.reduce((a, b) => a + Number(b.balance || 0), 0));

        const results = [];
        for (let age = startAge; age <= 100; age++) {
            if (age > startAge) {
                const isRetired = age >= retAge;
                cStock *= stockG;
                cRE *= reG;
                
                if (!isRetired) {
                    // Complex 401k Logic: Base vs Bonus contributions
                    data.income.forEach(inc => {
                        const base = Number(inc.amount);
                        const total = base * (1 + (Number(inc.bonusPct) / 100));
                        const personal = inc.contribIncBonus ? (total * (inc.contribution/100)) : (base * (inc.contribution/100));
                        const match = inc.matchIncBonus ? (total * (inc.match/100)) : (base * (inc.match/100));
                        cStock += (personal + match);
                    });
                } else {
                    const drawRate = age < 55 ? (data.drawEarly / 100) : (data.drawLate / 100);
                    cStock -= (cStock * drawRate);
                }
                cDebt *= 0.94; // Estimated debt payoff curve
            }
            results.push({ age, nw: (cStock + cRE) - cDebt });
        }
        return results;
    }
};