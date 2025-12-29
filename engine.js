export const engine = {
    formatCompact: (val) => {
        if (!val) return "$0";
        const abs = Math.abs(val);
        const sign = val < 0 ? "-" : "";
        if (abs >= 1000000) return sign + "$" + (abs / 1000000).toFixed(2).replace(/\.00$/, "") + "M";
        if (abs >= 1000) return sign + "$" + (abs / 1000).toPrecision(3) + "K";
        return sign + "$" + abs.toFixed(0);
    },

    calculateTaxes: (grossTaxable) => {
        const standardDeduction = 30000;
        const taxable = Math.max(0, grossTaxable - standardDeduction);
        // Simplified 2026 MFJ Brackets
        let tax = 0;
        if (taxable <= 23200) tax = taxable * 0.10;
        else if (taxable <= 94300) tax = 2320 + (taxable - 23200) * 0.12;
        else if (taxable <= 201050) tax = 10852 + (taxable - 94300) * 0.22;
        else tax = 34337 + (taxable - 201050) * 0.24;
        
        // Child Tax Credit Placeholder ($2000 x 4)
        return Math.max(0, tax - 8000);
    },

    updateSummary: (data) => {
        const assets = (data.investments?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0) +
                       (data.realEstate?.reduce((a, b) => a + Number(b.value || 0), 0) || 0) +
                       (data.otherAssets?.reduce((a, b) => a + Number(b.value || 0), 0) || 0);
        
        const liabilities = (data.realEstate?.reduce((a, b) => a + Number(b.mortgage || 0), 0) || 0) +
                            (data.debts?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0);

        let grossTotal = 0;
        let taxableIncome = 0;
        let total401k = 0;

        data.income?.forEach(inc => {
            const base = Number(inc.amount || 0);
            const bonus = base * (Number(inc.bonusPct || 0) / 100);
            const total = base + bonus;
            grossTotal += total;
            
            const isNonTaxable = inc.nonTaxableUntil && Number(inc.nonTaxableUntil) >= 2026;
            if (!isNonTaxable) taxableIncome += total;

            const personal401k = inc.contribIncludeBonus ? (total * (inc.contribution/100)) : (base * (inc.contribution/100));
            const companyMatch = inc.matchIncludeBonus ? (total * (inc.match/100)) : (base * (inc.match/100));
            total401k += personal401k + companyMatch;
            taxableIncome -= personal401k; // Pre-tax deduction
        });

        const fedTax = engine.calculateTaxes(taxableIncome);
        const monthlySavings = data.savings?.reduce((a, b) => a + Number(b.amount || 0), 0) || 0;
        const annualSavings = total401k + (monthlySavings * 12);
        
        document.getElementById('sum-assets').innerText = engine.formatCompact(assets);
        document.getElementById('sum-liabilities').innerText = engine.formatCompact(liabilities);
        document.getElementById('sum-networth').innerText = engine.formatCompact(assets - liabilities);
        document.getElementById('sum-income').innerText = engine.formatCompact(grossTotal);
        document.getElementById('sum-savings').innerText = engine.formatCompact(annualSavings);

        // Cashflow calculation
        const monthlyGross = grossTotal / 12;
        const monthlyTax = fedTax / 12;
        const cashflow = monthlyGross - monthlyTax - monthlySavings - (total401k / 12);
        document.getElementById('cashflow-value').innerText = engine.formatCompact(cashflow);
        document.getElementById('cashflow-math').innerText = `Gross (${engine.formatCompact(monthlyGross)}) - Tax (${engine.formatCompact(monthlyTax)}) - PreTax/Savings (${engine.formatCompact(monthlySavings + (total401k/12))})`;
    }
};