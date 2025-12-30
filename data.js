// --- UI TEMPLATES ---
const templates = {
    investment: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Account" class="bg-transparent outline-none w-full text-sm"></td>
        <td class="px-4 py-3"><select onchange="window.toggleCostBasis(this); window.autoSave()" class="bg-transparent outline-none text-xs text-slate-500">
            <option>Taxable</option><option>Pre-Tax (401k/IRA)</option><option>Post-Tax (Roth)</option><option>529 Plan</option><option>Cash/Physical</option></select></td>
        <td class="px-4 py-3 text-right">
            <input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm">
            <div class="cost-basis-container hidden"><label class="text-[8px] font-bold text-indigo-400 uppercase block">Cost Basis</label><input type="number" oninput="window.autoSave()" placeholder="Basis" class="w-full text-right text-[10px] text-indigo-400 outline-none bg-transparent"></div>
        </td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    housing: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Address" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-slate-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    other: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Asset" class="bg-transparent outline-none w-full text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
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
                <div class="flex flex-col"><label class="text-[8px] font-bold text-slate-400 uppercase">Base Salary</label><div class="flex items-center gap-1"><span class="text-slate-400 text-xs">$</span><input type="number" oninput="window.autoSave()" class="w-28 bg-white border border-slate-200 p-1 rounded font-bold text-right text-sm"></div></div>
                <div class="flex flex-col"><label class="text-[8px] font-bold text-slate-400 uppercase">Bonus %</label><div class="flex items-center gap-1"><input type="number" oninput="window.autoSave()" class="w-16 bg-white border border-slate-200 p-1 rounded font-bold text-right text-sm"><span>%</span></div></div>
                <div class="flex flex-col"><label class="text-[8px] font-bold text-slate-400 uppercase">Non-Taxable Until</label><input type="number" oninput="window.autoSave()" placeholder="Year" class="w-20 bg-white border border-slate-200 p-1 rounded text-xs text-center"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="flex flex-col"><div class="flex justify-between text-[9px] font-bold text-slate-500 mb-1 uppercase"><span>Annual Increase</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="10" step="0.1" value="0" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>401k Personal</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="30" step="1" value="0" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"><label class="text-[9px] flex gap-1 items-center"><input type="checkbox" onchange="window.autoSave()" checked> Include Bonus</label></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>401k Company Match</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="20" step="0.5" value="0" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"><label class="text-[9px] flex gap-1 items-center"><input type="checkbox" onchange="window.autoSave()" checked> Include Bonus</label></div>
            </div>
        </div>`,
    "savings-item": () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Contribution" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3"><select onchange="window.autoSave()" class="bg-transparent outline-none text-xs text-slate-500">
            <option>Roth</option><option>Taxable (Brokerage)</option><option>HSA</option><option>529 Plan</option><option>Pre-Tax Contribution</option></select></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-emerald-600 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    "budget-item": () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Expense" class="bg-transparent outline-none w-full text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-center outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3"><input type="number" oninput="window.autoSave()" placeholder="N/A" class="w-full text-center outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`
};

const engine = {
    formatCompact: (val) => {
        if (!val || isNaN(val)) return "$0";
        const abs = Math.round(Math.abs(val));
        const sign = val < 0 ? "-" : "";
        if (abs >= 1000000) return sign + "$" + (abs / 1000000).toFixed(2) + "M";
        if (abs >= 1000) return sign + "$" + (abs / 1000).toFixed(1) + "K";
        return sign + "$" + abs;
    },
    updateSummary: (data) => {
        const assets = (data.investments?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0) +
                       (data.realEstate?.reduce((a, b) => a + Number(b.value || 0), 0) || 0) +
                       (data.otherAssets?.reduce((a, b) => a + Number(b.value || 0), 0) || 0);
        const liabilities = (data.realEstate?.reduce((a, b) => a + Number(b.mortgage || 0), 0) || 0) +
                            (data.debts?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0);
        
        const currentAge = new Date().getFullYear() - (data.birthYear || 1986);
        const yearsToRetire = Math.max(0, (data.retAge || 62) - currentAge);
        
        const stockGrowth = 1 + (Number(data.stockGrowth || 8) / 100);
        const metalsGrowth = 1 + (Number(data.metalsGrowth || 2) / 100);
        const cryptoGrowth = 1 + (Number(data.cryptoGrowth || 10) / 100);

        let futurePortfolio = 0;
        data.investments?.forEach(inv => {
            const val = Number(inv.balance || 0);
            const lower = inv.name.toLowerCase();
            if (lower.includes('crypto') || lower.includes('btc') || lower.includes('eth')) {
                futurePortfolio += val * Math.pow(cryptoGrowth, yearsToRetire);
            } else if (lower.includes('gold') || lower.includes('silver') || lower.includes('metal')) {
                futurePortfolio += val * Math.pow(metalsGrowth, yearsToRetire);
            } else {
                futurePortfolio += val * Math.pow(stockGrowth, yearsToRetire);
            }
        });

        const drawRate = (data.retAge < 55) ? (Number(data.drawEarly || 4) / 100) : (Number(data.drawLate || 5) / 100);
        const annualDraw = futurePortfolio * drawRate;
        const annualSS = Number(data.ssAmount || 0) * 12;

        let grossTotal = 0, total401k = 0;
        data.income?.forEach(inc => {
            const base = Number(inc.amount || 0), bonus = base * (Number(inc.bonusPct || 0) / 100);
            grossTotal += (base + bonus);
            const p401k = inc.contribIncludeBonus ? ((base+bonus) * (inc.contribution/100)) : (base * (inc.contribution/100));
            const cMatch = inc.matchIncludeBonus ? ((base+bonus) * (inc.match/100)) : (base * (inc.match/100));
            total401k += p401k + cMatch;
        });

        const monthlySavings = data.savings?.reduce((a, b) => a + Number(b.amount || 0), 0) || 0;
        const annualSavings = total401k + (monthlySavings * 12);
        
        document.getElementById('sum-assets').innerText = engine.formatCompact(assets);
        document.getElementById('sum-liabilities').innerText = engine.formatCompact(liabilities);
        document.getElementById('sum-networth').innerText = engine.formatCompact(assets - liabilities);
        document.getElementById('sum-income').innerText = engine.formatCompact(grossTotal);
        document.getElementById('sum-savings').innerText = engine.formatCompact(annualSavings);
        document.getElementById('sum-ret-income').innerText = engine.formatCompact(annualDraw + annualSS);
    }
};

window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600'));
    document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
    document.getElementById(`btn-${tabId}`)?.classList.add('active', 'border-indigo-600', 'text-indigo-600');
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
    if (type === 'income') {
        row.querySelector('input[placeholder="Source Name"]').value = data.name || '';
        const nums = row.querySelectorAll('input[type=number]');
        nums[0].value = data.amount || 0; nums[1].value = data.bonusPct || 0; nums[2].value = data.nonTaxableUntil || '';
        const ranges = row.querySelectorAll('input[type=range]');
        ranges[0].value = data.increase || 0; ranges[1].value = data.contribution || 0; ranges[2].value = data.match || 0;
        ranges.forEach(r => r.previousElementSibling.lastElementChild.innerText = r.value + '%');
    } else {
        const inputs = row.querySelectorAll('input');
        if (inputs[0]) inputs[0].value = data.name || data.address || '';
        if (inputs[1]) inputs[1].value = data.balance || data.value || data.amount || 0;
        if (inputs[2]) inputs[2].value = data.mortgage || data.basis || data.inc || 0;
        if (inputs[3]) inputs[3].value = data.tax || data.endYear || 0;
        const select = row.querySelector('select');
        if (select && data.class) select.value = data.class;
    }
}

window.calculateUserAge = () => {
    const val = document.getElementById('user-birth-year').value;
    document.getElementById('display-age').innerText = (new Date().getFullYear() - val) + " YRS OLD";
    window.autoSave();
};

window.autoSave = () => {
    const data = {
        birthYear: document.getElementById('user-birth-year').value,
        inflation: document.getElementById('input-inflation').value,
        stockGrowth: document.getElementById('input-stock').value,
        reAppreciation: document.getElementById('input-re').value,
        metalsGrowth: document.getElementById('input-metals').value,
        cryptoGrowth: document.getElementById('input-crypto').value,
        retAge: document.getElementById('input-ret-age').value,
        ssAge: document.getElementById('input-ss-age').value,
        ssAmount: document.getElementById('input-ss-amount').value,
        drawEarly: document.getElementById('input-draw-early').value,
        drawLate: document.getElementById('input-draw-late').value,
        investments: Array.from(document.querySelectorAll('#investment-rows tr')).map(r => ({
            name: r.cells[0]?.querySelector('input')?.value || '',
            class: r.cells[1]?.querySelector('select')?.value || '',
            balance: r.cells[2]?.querySelector('input[type=number]')?.value || 0
        })),
        realEstate: Array.from(document.querySelectorAll('#housing-list tr')).map(r => ({
            address: r.cells[0]?.querySelector('input')?.value || '',
            value: r.cells[1]?.querySelector('input')?.value || 0,
            mortgage: r.cells[2]?.querySelector('input')?.value || 0,
            tax: r.cells[3]?.querySelector('input')?.value || 0
        })),
        otherAssets: Array.from(document.querySelectorAll('#other-assets-list tr')).map(r => ({
            name: r.cells[0]?.querySelector('input')?.value || '',
            value: r.cells[1]?.querySelector('input')?.value || 0
        })),
        debts: Array.from(document.querySelectorAll('#debt-rows tr')).map(r => ({
            name: r.cells[0]?.querySelector('input')?.value || '',
            balance: r.cells[1]?.querySelector('input')?.value || 0
        })),
        income: Array.from(document.querySelectorAll('#income-list > div')).map(d => ({
            name: d.querySelector('input[placeholder="Source Name"]')?.value || '',
            amount: d.querySelectorAll('input[type=number]')[0]?.value || 0,
            bonusPct: d.querySelectorAll('input[type=number]')[1]?.value || 0,
            increase: d.querySelectorAll('input[type=range]')[0]?.value || 0,
            contribution: d.querySelectorAll('input[type=range]')[1]?.value || 0,
            match: d.querySelectorAll('input[type=range]')[2]?.value || 0
        })),
        savings: Array.from(document.querySelectorAll('#savings-rows tr')).map(r => ({
            name: r.cells[0]?.querySelector('input')?.value || '',
            class: r.cells[1]?.querySelector('select')?.value || '',
            amount: r.cells[2]?.querySelector('input')?.value || 0
        })),
        budget: Array.from(document.querySelectorAll('#budget-rows tr')).map(r => ({
            name: r.cells[0]?.querySelector('input')?.value || '',
            amount: r.cells[1]?.querySelector('input')?.value || 0,
            inc: r.cells[2]?.querySelector('input')?.value || 0,
            endYear: r.cells[3]?.querySelector('input')?.value || 0
        }))
    };
    engine.updateSummary(data);
    if (window.saveUserData) window.saveUserData(data);
};

window.loadUserDataIntoUI = (data) => {
    if (!data || !data.income) {
        window.addRow('income-list', 'income', { name: 'Primary Salary', amount: 0 });
    }
    if (!data || !data.savings || data.savings.length === 0) {
        const s = [['Roth', 'Post-Tax (Roth)'], ['HSA', 'HSA'], ['529', '529 Plan'], ['Other Savings', 'Taxable (Brokerage)']];
        s.forEach(x => window.addRow('savings-rows', 'savings-item', { name: x[0], class: x[1], amount: 0 }));
    }
    if (!data || !data.budget || data.budget.length === 0) {
        [['Mortgage', 1500], ['Car', 500], ['Food', 500]].forEach(x => window.addRow('budget-rows', 'budget-item', { name: x[0], amount: x[1] }));
    }
    
    if (data) {
        document.getElementById('user-birth-year').value = data.birthYear || 1986;
        const setVal = (id, val, suffix='') => {
            const el = document.getElementById(id);
            if (el) { el.value = val; const d = document.getElementById('val-' + id.split('-')[1]); if (d) d.innerText = val + suffix; }
        };
        setVal('input-inflation', data.inflation || 3, '%');
        setVal('input-stock', data.stockGrowth || 8, '%');
        setVal('input-re', data.reAppreciation || 3, '%');
        setVal('input-metals', data.metalsGrowth || 2, '%');
        setVal('input-crypto', data.cryptoGrowth || 10, '%');
        
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
            if (c && m[2] && m[2].length > 0) { c.innerHTML = ''; m[2].forEach(item => window.addRow(m[0], m[1], item)); }
        });
    }
    engine.updateSummary(data || {});
    window.calculateUserAge();
};