let growthChart = null;

const engine = {
    formatCompact: (val) => {
        if (val === undefined || isNaN(val)) return "$0";
        const abs = Math.round(Math.abs(val));
        const sign = val < 0 ? "-" : "";
        if (abs >= 1000000) return sign + "$" + (abs / 1000000).toFixed(2) + "M";
        if (abs >= 1000) return sign + "$" + (abs / 1000).toFixed(1) + "K";
        return sign + "$" + abs;
    },

    // ADVANCED TAX LOGIC RESTORED
    calculateTaxes: (grossTaxable) => {
        const standardDeduction = 30000;
        const taxable = Math.max(0, grossTaxable - standardDeduction);
        let tax = 0;
        if (taxable <= 23200) tax = taxable * 0.10;
        else if (taxable <= 94300) tax = 2320 + (taxable - 23200) * 0.12;
        else if (taxable <= 201050) tax = 10852 + (taxable - 94300) * 0.22;
        else tax = 34337 + (taxable - 201050) * 0.24;
        
        return Math.max(0, tax - 8000); // $2000 x 4 kids
    },

    getTableData: (selector, props) => {
        return Array.from(document.querySelectorAll(selector)).map(row => {
            const inputs = row.querySelectorAll('input, select');
            const obj = {};
            props.forEach((prop, i) => {
                if (!inputs[i]) return;
                // Handle checkboxes for 401k logic
                const val = inputs[i].type === 'checkbox' ? inputs[i].checked : inputs[i].value;
                obj[prop] = (inputs[i].type === 'number' || inputs[i].type === 'range') ? Number(val) : val;
            });
            return obj;
        });
    },

    runProjection: (data) => {
        const startAge = new Date().getFullYear() - (data.birthYear || 1986);
        const retAge = data.retAge || 55;
        const ssAge = data.ssAge || 67;
        const ssMonthly = data.ssInc || 3000;
        
        let cStock = 0, cMetals = 0, cCrypto = 0;
        data.investments.forEach(inv => {
            if (inv.class === 'Metals') cMetals += Number(inv.balance);
            else if (inv.class === 'Crypto') cCrypto += Number(inv.balance);
            else cStock += Number(inv.balance);
        });

        let cRE = data.realEstate.reduce((a, b) => a + Number(b.value || 0), 0);
        let cOther = data.otherAssets.reduce((a, b) => a + Number(b.value || 0), 0);
        let cDebt = (data.realEstate.reduce((a, b) => a + Number(b.mortgage || 0), 0)) +
                    (data.otherAssets.reduce((a, b) => a + Number(b.debt || 0), 0)) +
                    (data.debts.reduce((a, b) => a + Number(b.balance || 0), 0));

        const stockG = 1 + (data.stockGrowth / 100);
        const reG = 1 + (data.reAppreciation / 100);
        const metalsG = 1 + (data.metalsGrowth / 100);
        const cryptoG = 1 + (data.cryptoGrowth / 100);
        const inflG = 1 + (data.inflation / 100);

        const labels = [], invData = [], reData = [], otherData = [], debtData = [], nwData = [];
        const tableBody = document.getElementById('projection-table-body');
        if (tableBody) tableBody.innerHTML = '';

        for (let age = startAge; age <= 100; age++) {
            if (age > startAge) {
                const isRetired = age >= retAge;
                cStock *= stockG; cMetals *= metalsG; cCrypto *= cryptoG; cRE *= reG;
                
                if (!isRetired) {
                    data.income.forEach(inc => {
                        const base = Number(inc.amount);
                        const bonus = base * (Number(inc.bonusPct) / 100);
                        const total = base + bonus;
                        
                        // RESTORED: Bonus-dependent 401k logic
                        const personal401k = inc.contribIncBonus ? (total * (inc.contribution/100)) : (base * (inc.contribution/100));
                        const companyMatch = inc.matchIncBonus ? (total * (inc.match/100)) : (base * (inc.match/100));
                        
                        cStock += (personal401k + companyMatch);
                    });
                    data.savings.forEach(s => {
                        if (s.class === 'Metals') cMetals += s.amount;
                        else if (s.class === 'Crypto') cCrypto += s.amount;
                        else cStock += s.amount;
                    });
                } else {
                    const rate = age < 55 ? (data.drawEarly / 100) : (data.drawLate / 100);
                    cStock -= (cStock * rate);
                }
                if (age >= ssAge) cStock += (ssMonthly * 12);
                cDebt *= 0.92;
            }

            const totalInv = cStock + cMetals + cCrypto;
            const netWorth = (totalInv + cRE + cOther) - cDebt;
            const todaysValue = netWorth / Math.pow(inflG, (age - startAge));

            labels.push(age); invData.push(Math.round(totalInv)); reData.push(Math.round(cRE));
            otherData.push(Math.round(cOther)); debtData.push(Math.round(-cDebt)); nwData.push(Math.round(netWorth));

            if (tableBody && (age % 5 === 0 || age === startAge || age === 100)) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td class="px-4 py-2 font-bold">${age}</td>
                    <td class="px-4 py-2 text-right">${engine.formatCompact(totalInv)}</td>
                    <td class="px-4 py-2 text-right">${engine.formatCompact(cRE)}</td>
                    <td class="px-4 py-2 text-right">${engine.formatCompact(cOther)}</td>
                    <td class="px-4 py-2 text-right text-red-500">${engine.formatCompact(cDebt)}</td>
                    <td class="px-4 py-2 text-right font-black text-indigo-600">${engine.formatCompact(netWorth)}</td>
                    <td class="px-4 py-2 text-right font-bold text-emerald-600">${engine.formatCompact(todaysValue)}</td>`;
                tableBody.appendChild(tr);
            }
        }
        engine.renderChart(labels, invData, reData, otherData, debtData, nwData);
    },

    renderChart: (labels, inv, re, other, debt, nw) => {
        const ctx = document.getElementById('growthChart')?.getContext('2d');
        if (!ctx) return;
        if (growthChart) growthChart.destroy();
        growthChart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets: [
                { label: 'Investments', data: inv, fill: true, backgroundColor: 'rgba(79, 70, 229, 0.7)', pointRadius: 0, stack: 'assets' },
                { label: 'Real Estate', data: re, fill: true, backgroundColor: 'rgba(16, 185, 129, 0.7)', pointRadius: 0, stack: 'assets' },
                { label: 'Other Assets', data: other, fill: true, backgroundColor: 'rgba(245, 158, 11, 0.7)', pointRadius: 0, stack: 'assets' },
                { label: 'Debt', data: debt, fill: true, backgroundColor: 'rgba(239, 68, 68, 0.5)', pointRadius: 0, stack: 'assets' }
            ]},
            options: { responsive: true, maintainAspectRatio: false, 
                plugins: { tooltip: { mode: 'index', intersect: false }, legend: { position: 'bottom', labels: { boxWidth: 10 }}},
                scales: { x: { grid: { display: false }}, y: { ticks: { callback: v => engine.formatCompact(v) }}}
            }
        });
    },

    updateSummary: (data) => {
        const assets = (data.investments?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0) +
                       (data.realEstate?.reduce((a, b) => a + Number(b.value || 0), 0) || 0) +
                       (data.otherAssets?.reduce((a, b) => a + Number(b.value || 0), 0) || 0);
        const liab = (data.realEstate?.reduce((a, b) => a + Number(b.mortgage || 0), 0) || 0) +
                     (data.otherAssets?.reduce((a, b) => a + Number(b.debt || 0), 0) || 0) +
                     (data.debts?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0);

        let annualGross = 0, total401k = 0, taxableIncome = 0;
        data.income?.forEach(inc => {
            const base = Number(inc.amount);
            const total = base * (1 + (Number(inc.bonusPct) / 100));
            annualGross += total;
            
            const personal401k = inc.contribIncBonus ? (total * (inc.contribution/100)) : (base * (inc.contribution/100));
            const companyMatch = inc.matchIncBonus ? (total * (inc.match/100)) : (base * (inc.match/100));
            total401k += (personal401k + companyMatch);

            const isNonTaxable = inc.nonTaxYear && Number(inc.nonTaxYear) >= new Date().getFullYear();
            if (!isNonTaxable) taxableIncome += (total - personal401k);
        });

        const fedTax = engine.calculateTaxes(taxableIncome);
        const set = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };
        
        set('sum-assets', engine.formatCompact(assets));
        set('sum-liabilities', engine.formatCompact(liab));
        set('sum-networth', engine.formatCompact(assets - liab));
        set('sum-income', engine.formatCompact(annualGross));
        
        const currentDrawRate = (new Date().getFullYear() - data.birthYear) < 55 ? (data.drawEarly / 100) : (data.drawLate / 100);
        set('sum-ret-income', engine.formatCompact(assets * currentDrawRate));
        
        const budgetMonthly = data.budget?.reduce((a, b) => a + Number(b.amount || 0), 0) || 0;
        set('budget-sum-monthly', '$' + budgetMonthly.toLocaleString());
        set('budget-sum-annual', '$' + (budgetMonthly * 12).toLocaleString());
        
        // Accurate Cashflow Surplus calculation
        const monthlyNet = (annualGross - fedTax - (total401k - (data.income[0]?.match * data.income[0]?.amount / 100 || 0))) / 12;
        set('budget-sum-remaining', '$' + Math.round(monthlyNet - budgetMonthly).toLocaleString());

        engine.runProjection(data);
    }
};

window.autoSave = () => {
    const data = { birthYear: Number(document.getElementById('user-birth-year').value) };
    document.querySelectorAll('[data-bind]').forEach(el => data[el.getAttribute('data-bind')] = Number(el.value));

    data.investments = engine.getTableData('#investment-rows tr', ['name', 'class', 'balance', 'basis']);
    data.realEstate = engine.getTableData('#housing-list tr', ['address', 'value', 'mortgage', 'rent']);
    data.otherAssets = engine.getTableData('#other-assets-list tr', ['name', 'value', 'debt']);
    data.debts = engine.getTableData('#debt-rows tr', ['name', 'balance']);
    data.savings = engine.getTableData('#savings-rows tr', ['name', 'class', 'amount']);
    data.budget = engine.getTableData('#budget-rows tr', ['name', 'amount', 'endYear']);
    data.income = Array.from(document.querySelectorAll('#income-list > div')).map(d => ({
        name: d.querySelector('input[placeholder="Source Name"]')?.value || '',
        amount: d.querySelectorAll('input[type=number]')[0]?.value || 0,
        bonusPct: d.querySelectorAll('input[type=number]')[1]?.value || 0,
        nonTaxYear: d.querySelectorAll('input[type=number]')[2]?.value || 0,
        increase: d.querySelectorAll('input[type=range]')[0]?.value || 0,
        contribution: d.querySelectorAll('input[type=range]')[1]?.value || 0,
        contribIncBonus: d.querySelectorAll('input[type=checkbox]')[0]?.checked,
        match: d.querySelectorAll('input[type=range]')[2]?.value || 0,
        matchIncBonus: d.querySelectorAll('input[type=checkbox]')[1]?.checked
    }));

    window.currentData = data;
    engine.updateSummary(data);
    if (window.saveUserData) window.saveUserData(data);
};

window.loadUserDataIntoUI = (data) => {
    if (!data) return;
    window.currentData = data;
    document.getElementById('user-birth-year').value = data.birthYear || 1986;
    document.querySelectorAll('[data-bind]').forEach(el => {
        const val = data[el.getAttribute('data-bind')];
        if (val !== undefined) {
            el.value = val;
            const label = document.getElementById('val-' + el.id.split('-').pop());
            if (label) label.innerText = el.id.includes('inc') ? '$' + Number(val).toLocaleString() : val + (el.id.includes('age') ? '' : '%');
        }
    });

    const mapping = [
        ['investment-rows', 'investment', data.investments],
        ['housing-list', 'housing', data.realEstate],
        ['other-assets-list', 'other', data.otherAssets],
        ['debt-rows', 'debt', data.debts],
        ['income-list', 'income', data.income],
        ['savings-rows', 'savings-item', data.savings],
        ['budget-rows', 'budget-item', data.budget]
    ];
    mapping.forEach(m => {
        const c = document.getElementById(m[0]);
        if (c && m[2]) { c.innerHTML = ''; m[2].forEach(item => window.addRow(m[0], m[1], item)); }
    });
    engine.updateSummary(data);
};