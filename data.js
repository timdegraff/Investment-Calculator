let growthChart = null;

const templates = {
    investment: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Account" class="bg-transparent outline-none w-full text-sm"></td>
        <td class="px-4 py-3"><select onchange="window.autoSave()" class="bg-transparent outline-none text-xs text-slate-500">
            <option>Taxable</option><option>Pre-Tax (401k/IRA)</option><option>Post-Tax (Roth)</option><option>HSA</option><option>529 Plan</option><option>Metals</option><option>Crypto</option><option>Cash/Physical</option></select></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    housing: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Address" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-slate-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    other: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Asset" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    debt: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Debt Name" class="bg-transparent outline-none w-full text-sm font-bold text-slate-700"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    income: () => `
        <div class="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-4 relative group shadow-sm">
            <button onclick="this.parentElement.remove(); window.autoSave()" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-times text-xs"></i></button>
            <div class="flex flex-wrap gap-4 items-center">
                <input type="text" oninput="window.autoSave()" placeholder="Source Name" class="bg-transparent font-black text-slate-700 outline-none text-sm flex-grow">
                <div class="flex flex-col"><label class="text-xs font-bold text-slate-400 uppercase">Base Salary</label><div class="flex items-center gap-1"><span class="text-slate-400 text-sm">$</span><input type="number" oninput="window.autoSave()" class="w-28 bg-white border border-slate-200 p-1 rounded font-bold text-right text-sm"></div></div>
                <div class="flex flex-col"><label class="text-xs font-bold text-slate-400 uppercase">Bonus %</label><div class="flex items-center gap-1"><input type="number" oninput="window.autoSave()" class="w-16 bg-white border border-slate-200 p-1 rounded font-bold text-right text-sm"><span>%</span></div></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="flex flex-col"><div class="flex justify-between text-sm font-bold text-slate-500 mb-1 uppercase"><span>Annual Increase</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="10" step="0.1" value="0" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-sm font-bold text-slate-500 uppercase"><span>401k Personal</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="30" step="1" value="0" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-sm font-bold text-slate-500 uppercase"><span>401k Match</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="20" step="0.5" value="0" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"></div>
            </div>
        </div>`,
    "savings-item": () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Contribution" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3"><select onchange="window.autoSave()" class="bg-transparent outline-none text-xs text-slate-500">
            <option>Taxable</option><option>Roth</option><option>HSA</option><option>529 Plan</option><option>Metals</option><option>Crypto</option></select></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-emerald-600 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    "budget-item": () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Expense" class="bg-transparent outline-none w-full text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-indigo-600 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-center"><input type="number" oninput="window.autoSave()" placeholder="N/A" class="w-full text-center outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`
};

const engine = {
    formatCompact: (val) => {
        if (val === undefined || isNaN(val)) return "$0";
        const abs = Math.round(Math.abs(val));
        const sign = val < 0 ? "-" : "";
        if (abs >= 1000000) return sign + "$" + (abs / 1000000).toFixed(2) + "M";
        if (abs >= 1000) return sign + "$" + (abs / 1000).toFixed(1) + "K";
        return sign + "$" + abs;
    },

    getTableData: (selector, props) => {
        return Array.from(document.querySelectorAll(selector)).map(row => {
            const inputs = row.querySelectorAll('input, select');
            const obj = {};
            props.forEach((prop, i) => {
                if (!inputs[i]) return;
                const val = inputs[i].value;
                obj[prop] = inputs[i].type === 'number' || inputs[i].type === 'range' ? Number(val) : val;
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
                        const totalSal = Number(inc.amount) * (1 + (Number(inc.bonusPct) / 100));
                        cStock += totalSal * ((Number(inc.contribution) + Number(inc.match)) / 100);
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

        let annualGross = 0, total401k = 0;
        data.income?.forEach(inc => {
            const total = Number(inc.amount) * (1 + (Number(inc.bonusPct) / 100));
            annualGross += total;
            total401k += total * ((Number(inc.contribution) + Number(inc.match)) / 100);
        });

        const budgetMonthly = data.budget?.reduce((a, b) => a + Number(b.amount || 0), 0) || 0;
        const set = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };
        
        set('sum-assets', engine.formatCompact(assets));
        set('sum-liabilities', engine.formatCompact(liab));
        set('sum-networth', engine.formatCompact(assets - liab));
        set('sum-income', engine.formatCompact(annualGross));
        set('sum-savings', engine.formatCompact(total401k + (data.savings?.reduce((a,b)=>a+Number(b.amount||0), 0) || 0)));
        set('budget-sum-monthly', '$' + budgetMonthly.toLocaleString());
        set('budget-sum-annual', '$' + (budgetMonthly * 12).toLocaleString());
        set('budget-sum-remaining', '$' + Math.round(((annualGross * 0.75) / 12) - budgetMonthly).toLocaleString());
        
        const currentDrawRate = (new Date().getFullYear() - data.birthYear) < 55 ? (data.drawEarly / 100) : (data.drawLate / 100);
        set('sum-ret-income', engine.formatCompact(assets * currentDrawRate));

        engine.runProjection(data);
    }
};

window.autoSave = () => {
    const data = { birthYear: Number(document.getElementById('user-birth-year').value) };
    document.querySelectorAll('[data-bind]').forEach(el => data[el.getAttribute('data-bind')] = Number(el.value));

    data.investments = engine.getTableData('#investment-rows tr', ['name', 'class', 'balance']);
    data.realEstate = engine.getTableData('#housing-list tr', ['address', 'value', 'mortgage']);
    data.otherAssets = engine.getTableData('#other-assets-list tr', ['name', 'value', 'debt']);
    data.debts = engine.getTableData('#debt-rows tr', ['name', 'balance']);
    data.savings = engine.getTableData('#savings-rows tr', ['name', 'class', 'amount']);
    data.budget = engine.getTableData('#budget-rows tr', ['name', 'amount', 'endYear']);
    data.income = Array.from(document.querySelectorAll('#income-list > div')).map(d => ({
        name: d.querySelector('input[placeholder="Source Name"]')?.value || '',
        amount: d.querySelectorAll('input[type=number]')[0]?.value || 0,
        bonusPct: d.querySelectorAll('input[type=number]')[1]?.value || 0,
        increase: d.querySelectorAll('input[type=range]')[0]?.value || 0,
        contribution: d.querySelectorAll('input[type=range]')[1]?.value || 0,
        match: d.querySelectorAll('input[type=range]')[2]?.value || 0
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

    const mapping = [['investment-rows', 'investment', data.investments], ['housing-list', 'housing', data.realEstate], ['other-assets-list', 'other', data.otherAssets], ['debt-rows', 'debt', data.debts], ['income-list', 'income', data.income], ['savings-rows', 'savings-item', data.savings], ['budget-rows', 'budget-item', data.budget]];
    mapping.forEach(m => {
        const c = document.getElementById(m[0]);
        if (c && m[2]) { c.innerHTML = ''; m[2].forEach(item => window.addRow(m[0], m[1], item)); }
    });
    engine.updateSummary(data);
};

window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600'));
    document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
    document.getElementById(`btn-${tabId}`)?.classList.add('active', 'border-indigo-600', 'text-indigo-600');
    if (tabId === 'growth') engine.runProjection(window.currentData);
};

window.addRow = (containerId, type, data = null) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const row = document.createElement(type === 'income' ? 'div' : 'tr');
    if (type !== 'income') row.className = "border-t border-slate-100";
    row.innerHTML = templates[type]();
    container.appendChild(row);
    if (data) fillRow(row, type, data);
    return row;
};

function fillRow(row, type, data) {
    const inputs = row.querySelectorAll('input, select');
    if (type === 'income') {
        inputs[0].value = data.name; inputs[1].value = data.amount; inputs[2].value = data.bonusPct;
        const ranges = row.querySelectorAll('input[type=range]');
        ranges[0].value = data.increase; ranges[1].value = data.contribution; ranges[2].value = data.match;
        ranges.forEach(r => r.previousElementSibling.lastElementChild.innerText = r.value + '%');
    } else {
        Object.values(data).forEach((val, i) => { if(inputs[i]) inputs[i].value = val; });
    }
}

window.calculateUserAge = () => {
    const val = document.getElementById('user-birth-year').value;
    document.getElementById('display-age').innerText = (new Date().getFullYear() - val) + " YRS OLD";
    window.autoSave();
};

window.exportCSV = engine.exportCSV;