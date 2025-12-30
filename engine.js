const engine = {
    // 1. Core Projection Logic (Asset Growth & Drawdowns)
    runProjection: (data) => {
        const startAge = new Date().getFullYear() - (data.birthYear || 1986);
        const stockG = 1 + (data.assumptions.stockGrowth / 100);
        const reG = 1 + (data.assumptions.reAppreciation / 100);

        let cStock = data.investments.reduce((a, b) => a + Number(b.value || 0), 0);
        let cRE = data.realEstate.reduce((a, b) => a + Number(b.value || 0), 0);
        let cOther = data.otherAssets.reduce((a, b) => a + Number(b.value || 0), 0);
        let cDebt = (data.realEstate.reduce((a, b) => a + Number(b.debt || 0), 0)) +
                    (data.otherAssets.reduce((a, b) => a + Number(b.debt || 0), 0)) +
                    (data.debts.reduce((a, b) => a + Number(b.balance || 0), 0));

        const results = [];
        for (let age = startAge; age <= 100; age++) {
            if (age > startAge) {
                cStock *= stockG;
                cRE *= reG;

                data.income.forEach(inc => {
                    const base = Number(inc.amount);
                    const total = base * (1 + (Number(inc.bonusPct) / 100));
                    const personal = inc.contribIncBonus ? (total * (inc.contribution/100)) : (base * (inc.contribution/100));
                    const match = inc.matchIncBonus ? (total * (inc.match/100)) : (base * (inc.match/100));
                    cStock += (personal + match);
                });
                cDebt *= 0.94; // Estimated debt payoff curve
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
        engine.displayProjection(results, data.assumptions.inflation);
    },

    // 2. Display Projection Data
    displayProjection: (results, inflation) => {
        const body = document.getElementById('projection-table-body');
        const summaryNetWorth = document.getElementById('sum-networth');
        const summaryAssets = document.getElementById('sum-assets');
        const summaryLiabilities = document.getElementById('sum-liabilities');
        const summaryIncome = document.getElementById('sum-income');
        
        if (!body) return;
        body.innerHTML = '';
        
        results.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = templates.projectionRow(row, inflation);
            body.appendChild(tr);
        });
        
        // Update dashboard summaries
        const firstRow = results[0];
        if (firstRow) {
            const totalAssets = firstRow.portfolio + firstRow.realEstate + firstRow.otherAssets;
            summaryNetWorth.textContent = math.toCurrency(firstRow.netWorth);
            summaryAssets.textContent = math.toCurrency(totalAssets);
            summaryLiabilities.textContent = math.toCurrency(firstRow.debt);
        }
    },

    // 3. Update Age Display
    updateAgeDisplay: () => {
        const birthYear = document.getElementById('user-birth-year').value;
        const currentAge = new Date().getFullYear() - birthYear;
        document.getElementById('current-age-display').textContent = `(Age ${currentAge})`;
    },

    // 4. Get Table Data
    getTableData: (selector, fields) => {
        return Array.from(document.querySelectorAll(selector)).map(row => {
            const inputs = row.querySelectorAll('input, select');
            const rowData = {};
            fields.forEach((field, i) => {
                rowData[field] = inputs[i]?.type === 'checkbox' ? inputs[i].checked : inputs[i]?.value;
            });
            return rowData;
        });
    }
};