const engine = {

    /**
     * 1. Central Summary Calculator
     * Takes the entire data object and returns all calculated summary metrics.
     */
    calculateSummaries: (data) => {
        const summaries = {};

        // --- Assets & Liabilities ---
        const totalInvestments = data.investments?.reduce((a, b) => a + Number(b.value || 0), 0) || 0;
        const totalRealEstate = data.realEstate?.reduce((a, b) => a + Number(b.value || 0), 0) || 0;
        const totalOtherAssets = data.otherAssets?.reduce((a, b) => a + Number(b.value || 0), 0) || 0;
        summaries.totalAssets = totalInvestments + totalRealEstate + totalOtherAssets;

        const realEstateDebt = data.realEstate?.reduce((a, b) => a + Number(b.debt || 0), 0) || 0;
        const otherAssetDebt = data.otherAssets?.reduce((a, b) => a + Number(b.debt || 0), 0) || 0;
        const standaloneDebt = data.debts?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0;
        summaries.totalLiabilities = realEstateDebt + otherAssetDebt + standaloneDebt;

        summaries.netWorth = summaries.totalAssets - summaries.totalLiabilities;

        // --- Income & Savings ---
        let currentAnnualGross = 0;
        let projected2026Gross = 0;
        let totalPersonal401k = 0;
        let totalMatch401k = 0;
        const yearsTo2026 = 2026 - new Date().getFullYear();

        data.income?.forEach(inc => {
            const base = Number(inc.amount) || 0;
            const bonus = base * (Number(inc.bonusPct) / 100);
            const increaseRate = 1 + (Number(inc.increase) / 100);
            
            currentAnnualGross += base + bonus;
            projected2026Gross += (base * Math.pow(increaseRate, yearsTo2026)) + bonus; // Simplified bonus projection

            const personalContribTotal = inc.contribIncBonus ? (base + bonus) : base;
            totalPersonal401k += personalContribTotal * (Number(inc.contribution) / 100);

            const matchContribTotal = inc.matchIncBonus ? (base + bonus) : base;
            totalMatch401k += matchContribTotal * (Number(inc.match) / 100);
        });

        summaries.grossIncome2026 = projected2026Gross;
        summaries.workplaceSavings = { personal: totalPersonal401k, match: totalMatch401k };

        const manualSavings = data.manualSavings?.reduce((a, b) => a + Number(b.amount || 0), 0) || 0;
        summaries.totalAnnualSavings = totalPersonal401k + totalMatch401k + manualSavings;
        
        // --- Budget & Cashflow ---
        summaries.totalMonthlyExpenses = data.expenses?.reduce((a, b) => a + Number(b.amount || 0), 0) || 0;
        const annualTaxableIncome = currentAnnualGross - totalPersonal401k; // Simplified deduction
        const estimatedAnnualTaxes = math.calculateProgressiveTax(annualTaxableIncome);
        const netAnnualIncome = currentAnnualGross - estimatedAnnualTaxes;
        summaries.estimatedMonthlyCashflow = (netAnnualIncome / 12) - summaries.totalMonthlyExpenses - (manualSavings / 12);

        return summaries;
    },

    /**
     * 2. Core Projection Logic (Asset Growth & Drawdowns)
     */
    runProjection: (data) => {
        if (!data || !data.assumptions) return;

        const { assumptions, investments, realEstate, otherAssets, income, manualSavings, debts } = data;
        const startAge = new Date().getFullYear() - (assumptions.birthYear || 1986);
        const stockG = 1 + (Number(assumptions.stockGrowth) / 100);
        const reG = 1 + (Number(assumptions.reAppreciation) / 100);

        const summaries = engine.calculateSummaries(data);
        let cStock = investments?.reduce((a, b) => a + Number(b.value || 0), 0) || 0;
        let cRE = realEstate?.reduce((a, b) => a + Number(b.value || 0), 0) || 0;
        let cOther = otherAssets?.reduce((a, b) => a + Number(b.value || 0), 0) || 0;
        let cDebt = summaries.totalLiabilities;

        const annualSavings = summaries.totalAnnualSavings;

        const results = [];
        for (let age = startAge; age <= 100; age++) {
            if (age > startAge) {
                cStock = cStock * stockG + annualSavings; // Simplified: assumes all savings are invested
                cRE *= reG;
                cDebt *= 0.95; // Simplified 5% annual debt reduction
            }
            results.push({ 
                age,
                portfolio: cStock,
                realEstate: cRE,
                otherAssets: cOther,
                debt: cDebt,
                netWorth: (cStock + cRE + cOther) - cDebt
            });
        }
        engine.displayProjection(results, assumptions);
    },

    /**
     * 3. Display Projection Data in the Table
     */
    displayProjection: (results, assumptions) => {
        const body = document.getElementById('projection-table-body');
        if (!body) return;
        body.innerHTML = '';
        
        results.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = "border-t border-slate-100";
            tr.innerHTML = templates.projectionRow(row, assumptions);
            body.appendChild(tr);
        });
    }
};