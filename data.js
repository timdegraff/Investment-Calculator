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
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Property" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-400 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-slate-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    other: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Asset" class="bg-transparent outline-none w-full text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    debt: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Debt Name" class="bg-transparent outline-none w-full text-sm font-bold text-red-400"></td>
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
                <div class="flex flex-col"><div class="flex justify-between text-[9px] font-bold text-slate-500 mb-1 uppercase"><span>Annual Increase</span><span class="text-indigo-600">3.5%</span></div><input type="range" min="0" max="10" step="0.1" value="3.5" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>401k Personal</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="30" step="1" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"><label class="text-[9px] flex gap-1 items-center"><input type="checkbox" onchange="window.autoSave()" checked> Include Bonus</label></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>401k Company</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="20" step="0.5" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"><label class="text-[9px] flex gap-1 items-center"><input type="checkbox" onchange="window.autoSave()" checked> Include Bonus</label></div>
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
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-400 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`
};

// --- MATH ENGINE ---
const engine = {
    formatCompact: (val) => {
        if (!val) return "$0";
        const abs = Math.abs(val);
        const sign = val < 0 ? "-" : "";
        if (abs >= 1000000) return sign + "$" + (abs / 1000000).toFixed(2).replace(/\.00$/, "") + "M";
        if (abs >= 1000) return sign + "$" + (abs / 1000).toPrecision(3) + "K";
        return sign + "$" + abs.toFixed(0);
    },
    calculateTaxes: (grossTaxable) => {
        const taxable = Math.max(0, grossTaxable - 30000);
        let tax = 0;
        if (taxable <= 23200) tax = taxable * 0.10;
        else if (taxable <= 94300) tax = 2320 + (taxable - 23200) * 0.12;
        else if (taxable <= 201050) tax = 10852 + (taxable - 94300) * 0.22;
        else tax = 34337 + (taxable - 201050) * 0.24;
        return Math.max(0, tax - 8000);
    },
    updateSummary: (data) => {
        const assets = (data.investments?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0) +
                       (data.realEstate?.reduce((a, b) => a + Number(b.value || 0), 0) || 0) +
                       (data.otherAssets?.reduce((a, b) => a + Number(b.value || 0), 0) || 0);
        const liabilities = (data.realEstate?.reduce((a, b) => a + Number(b.mortgage || 0), 0) || 0) +
                            (data.debts?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0);
        let grossTotal = 0, taxableIncome = 0, total401k = 0;
        data.income?.forEach(inc => {
            const base = Number(inc.amount || 0), bonus = base * (Number(inc.bonusPct || 0) / 100), total = base + bonus;
            grossTotal += total;
            if (!(inc.nonTaxableUntil && Number(inc.nonTaxableUntil) >= 2026)) taxableIncome += total;
            const p401k = inc.contribIncludeBonus ? (total * (inc.contribution/100)) : (base * (inc.contribution/100));
            const cMatch = inc.matchIncludeBonus ? (total * (inc.match/100)) : (base * (inc.match/100));
            total401k += p401k + cMatch; taxableIncome -= p401k;
        });
        const annualSavings = total401k + ((data.savings?.reduce((a, b) => a + Number(b.amount || 0), 0) || 0) * 12);
        document.getElementById('sum-assets').innerText = engine.formatCompact(assets);
        document.getElementById('sum-liabilities').innerText = engine.formatCompact(liabilities);
        document.getElementById('sum-networth').innerText = engine.formatCompact(assets - liabilities);
        document.getElementById('sum-income').innerText = engine.formatCompact(grossTotal);
        document.getElementById('sum-savings').innerText = engine.formatCompact(annualSavings);
    }
};

// --- GLOBAL ACTIONS ---
window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600'));
    document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
    document.getElementById(`btn-${tabId}`)?.classList.add('active', 'border-indigo-600', 'text-indigo-600');
};

window.addRow = (containerId, type) => {
    const container = document.getElementById(containerId);
    const row = document.createElement(type === 'income' ? 'div' : 'tr');
    if (type !== 'income') row.className = "border-t border-slate-100";
    row.innerHTML = templates[type]();
    container.appendChild(row);
};

window.calculateUserAge = () => {
    const val = document.getElementById('user-birth-year').value;
    document.getElementById('display-age').innerText = (new Date().getFullYear() - val) + " YRS OLD";
    window.autoSave();
};

window.toggleCostBasis = (el) => {
    const container = el.closest('tr').querySelector('.cost-basis-container');
    el.value === "Post-Tax (Roth)" ? container.classList.remove('hidden') : container.classList.add('hidden');
};

window.autoSave = () => {
    const data = {
        birthYear: document.getElementById('user-birth-year').value,
        investments: Array.from(document.querySelectorAll('#investment-rows tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            class: r.cells[1].querySelector('select').value,
            balance: r.cells[2].querySelector('input[type=number]').value,
            basis: r.querySelector('.cost-basis-container input')?.value
        })),
        realEstate: Array.from(document.querySelectorAll('#housing-list tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            value: r.cells[1].querySelector('input').value,
            mortgage: r.cells[2].querySelector('input').value,
            tax: r.cells[3].querySelector('input').value
        })),
        otherAssets: Array.from(document.querySelectorAll('#other-assets-list tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            value: r.cells[1].querySelector('input').value
        })),
        debts: Array.from(document.querySelectorAll('#debt-rows tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            balance: r.cells[1].querySelector('input').value
        })),
        income: Array.from(document.querySelectorAll('#income-list > div')).map(d => ({
            name: d.querySelector('input[placeholder="Source Name"]').value,
            amount: d.querySelectorAll('input[type=number]')[0].value,
            bonusPct: d.querySelectorAll('input[type=number]')[1].value,
            nonTaxableUntil: d.querySelectorAll('input[type=number]')[2].value,
            increase: d.querySelectorAll('input[type=range]')[0].value,
            contribution: d.querySelectorAll('input[type=range]')[1].value,
            contribIncludeBonus: d.querySelectorAll('input[type=checkbox]')[0].checked,
            match: d.querySelectorAll('input[type=range]')[2].value,
            matchIncludeBonus: d.querySelectorAll('input[type=checkbox]')[1].checked
        })),
        savings: Array.from(document.querySelectorAll('#savings-rows tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            class: r.cells[1].querySelector('select').value,
            amount: r.cells[2].querySelector('input').value
        })),
        budget: Array.from(document.querySelectorAll('#budget-rows tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            amount: r.cells[1].querySelector('input').value
        }))
    };
    engine.updateSummary(data);
    if (window.saveUserData) window.saveUserData(data);
};

window.loadUserDataIntoUI = (data) => {
    if (!data) return;
    document.getElementById('user-birth-year').value = data.birthYear || 1990;
    
    const mapping = [
        { id: 'investment-rows', type: 'investment', list: data.investments },
        { id: 'housing-list', type: 'housing', list: data.realEstate },
        { id: 'other-assets-list', type: 'other', list: data.otherAssets },
        { id: 'debt-rows', type: 'debt', list: data.debts },
        { id: 'income-list', type: 'income', list: data.income },
        { id: 'savings-rows', type: 'savings-item', list: data.savings },
        { id: 'budget-rows', type: 'budget-item', list: data.budget }
    ];

    mapping.forEach(m => {
        const container = document.getElementById(m.id);
        if (!container) return;
        container.innerHTML = '';
        m.list?.forEach(item => {
            window.addRow(m.id, m.type);
            const row = container.lastElementChild;
            if (m.type === 'income') {
                row.querySelector('input[placeholder="Source Name"]').value = item.name || '';
                const nums = row.querySelectorAll('input[type=number]');
                nums[0].value = item.amount; nums[1].value = item.bonusPct; nums[2].value = item.nonTaxableUntil;
                const ranges = row.querySelectorAll('input[type=range]');
                ranges[0].value = item.increase; ranges[1].value = item.contribution; ranges[2].value = item.match;
                ranges.forEach(r => r.previousElementSibling.lastElementChild.innerText = r.value + '%');
                const checks = row.querySelectorAll('input[type=checkbox]');
                checks[0].checked = item.contribIncludeBonus; checks[1].checked = item.matchIncludeBonus;
            } else {
                const inputs = row.querySelectorAll('input');
                const values = Object.values(item);
                values.forEach((val, i) => { if(inputs[i]) inputs[i].value = val; });
                const select = row.querySelector('select');
                if (select && item.class) select.value = item.class;
                if (item.class === "Post-Tax (Roth)") window.toggleCostBasis(select);
            }
        });
    });
    engine.updateSummary(data);
    window.calculateUserAge();
};