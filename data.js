window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600'));
    document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
    document.getElementById(`btn-${tabId}`)?.classList.add('active', 'border-indigo-600', 'text-indigo-600');
};

window.calculateUserAge = () => {
    const val = document.getElementById('user-birth-year').value;
    document.getElementById('display-age').innerText = new Date().getFullYear() - val;
    window.autoSave();
};

window.autoSave = () => {
    const data = {
        birthYear: document.getElementById('user-birth-year').value,
        investments: Array.from(document.querySelectorAll('#investment-rows tr')).map(row => ({
            name: row.cells[0].querySelector('input').value,
            class: row.cells[1].querySelector('select').value,
            balance: row.cells[2].querySelector('input[placeholder="Total Balance"]').value,
            basis: row.cells[2].querySelector('.cost-basis-container input')?.value || ""
        })),
        otherAssets: Array.from(document.querySelectorAll('#other-assets-list > div')).map(div => ({
            name: div.querySelector('input[placeholder*="Asset"]').value,
            value: div.querySelector('input[placeholder="$0"]').value
        })),
        realEstate: Array.from(document.querySelectorAll('#housing-list > div')).map(div => ({
            name: div.querySelector('input[placeholder*="Property"]').value,
            value: div.querySelectorAll('input[type=number]')[0].value,
            mortgage: div.querySelectorAll('input[type=number]')[1].value,
            tax: div.querySelectorAll('input[type=number]')[2].value
        })),
        income: Array.from(document.querySelectorAll('#income-list > div')).map(div => ({
            name: div.querySelector('input[placeholder="Income Name"]').value,
            amount: div.querySelector('input[placeholder="Annual Amt"]').value,
            taxFreeUntil: div.querySelector('input[placeholder="Never"]').value,
            increase: div.querySelectorAll('input[type=range]')[0].value,
            contribution: div.querySelectorAll('input[type=range]')[1].value,
            match: div.querySelectorAll('input[type=range]')[2].value
        }))
    };
    if (window.saveUserData) window.saveUserData(data);
};

window.loadUserDataIntoUI = (data) => {
    if (!data) return;
    if (data.birthYear) { document.getElementById('user-birth-year').value = data.birthYear; window.calculateUserAge(); }

    // Clear and Reload Sections
    const containers = {
        'investment-rows': { type: 'investment', data: data.investments },
        'other-assets-list': { type: 'other', data: data.otherAssets },
        'housing-list': { type: 'housing', data: data.realEstate },
        'income-list': { type: 'income', data: data.income }
    };

    Object.keys(containers).forEach(id => {
        document.getElementById(id).innerHTML = '';
        const config = containers[id];
        if (config.data) {
            config.data.forEach(item => {
                window.addRow(id, config.type);
                const el = document.getElementById(id).lastElementChild || document.getElementById(id).lastChild;
                
                if (config.type === 'investment') {
                    el.cells[0].querySelector('input').value = item.name || '';
                    el.cells[1].querySelector('select').value = item.class || 'Taxable';
                    el.cells[2].querySelector('input[placeholder="Total Balance"]').value = item.balance || '';
                    if (item.class === "Post-Tax (Roth)") {
                        window.toggleCostBasis(el.cells[1].querySelector('select'));
                        el.cells[2].querySelector('.cost-basis-container input').value = item.basis || '';
                    }
                } else if (config.type === 'other') {
                    el.querySelector('input[placeholder*="Asset"]').value = item.name || '';
                    el.querySelector('input[placeholder="$0"]').value = item.value || '';
                } else if (config.type === 'housing') {
                    el.querySelector('input[placeholder*="Property"]').value = item.name || '';
                    const inputs = el.querySelectorAll('input[type=number]');
                    inputs[0].value = item.value || '';
                    inputs[1].value = item.mortgage || '';
                    inputs[2].value = item.tax || '';
                } else if (config.type === 'income') {
                    el.querySelector('input[placeholder="Income Name"]').value = item.name || '';
                    el.querySelector('input[placeholder="Annual Amt"]').value = item.amount || '';
                    el.querySelector('input[placeholder="Never"]').value = item.taxFreeUntil || '';
                    const s = el.querySelectorAll('input[type=range]');
                    s[0].value = item.increase || 2; s[1].value = item.contribution || 0; s[2].value = item.match || 0;
                    s.forEach(slider => slider.previousElementSibling.lastElementChild.innerText = slider.value + '%');
                }
            });
        }
    });
};

window.addRow = (containerId, type) => {
    const container = document.getElementById(containerId);
    let html = '';
    if (type === 'investment') {
        const row = document.createElement('tr');
        row.className = "border-t border-slate-100";
        row.innerHTML = `
            <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Account" class="bg-transparent outline-none w-full text-sm"></td>
            <td class="px-4 py-3"><select onchange="window.toggleCostBasis(this); window.autoSave()" class="bg-transparent outline-none text-xs text-slate-500">
                <option>Taxable</option><option>Pre-Tax (401k/IRA)</option><option>Post-Tax (Roth)</option><option>529 Plan</option><option>Cash/Physical</option></select></td>
            <td class="px-4 py-3 text-right">
                <input type="number" oninput="window.autoSave()" placeholder="Total Balance" class="w-full text-right font-bold outline-none bg-transparent text-sm">
                <div class="cost-basis-container hidden"><label class="text-[8px] font-bold text-indigo-400 uppercase block">Cost Basis</label><input type="number" oninput="window.autoSave()" placeholder="Basis" class="w-full text-right text-[10px] text-indigo-400 outline-none bg-transparent"></div>
            </td>
            <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`;
        container.appendChild(row);
    } else if (type === 'housing') {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative group";
        div.innerHTML = `
            <button onclick="this.parentElement.remove(); window.autoSave()" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-times"></i></button>
            <input type="text" oninput="window.autoSave()" placeholder="Property Description" class="font-bold text-slate-700 outline-none border-b border-transparent focus:border-indigo-300">
            <div class="grid grid-cols-3 gap-3">
                <div><label class="text-[9px] font-bold text-slate-400 uppercase">Value</label><input type="number" oninput="window.autoSave()" class="w-full font-bold text-slate-600 bg-slate-50 p-2 rounded outline-none text-sm"></div>
                <div><label class="text-[9px] font-bold text-slate-400 uppercase">Mortgage</label><input type="number" oninput="window.autoSave()" class="w-full font-bold text-red-400 bg-slate-50 p-2 rounded outline-none text-sm"></div>
                <div><label class="text-[9px] font-bold text-slate-400 uppercase">Tax/Ins (Yearly)</label><input type="number" oninput="window.autoSave()" class="w-full font-bold text-slate-500 bg-slate-50 p-2 rounded outline-none text-sm"></div>
            </div>`;
        container.appendChild(div);
    } else if (type === 'income') {
        const div = document.createElement('div');
        div.className = "p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-4 relative group shadow-sm";
        div.innerHTML = `
            <button onclick="this.parentElement.remove(); window.autoSave()" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-times text-xs"></i></button>
            <div class="flex flex-wrap gap-4 items-center">
                <input type="text" oninput="window.autoSave()" placeholder="Income Name" class="bg-transparent font-black text-slate-700 outline-none text-sm flex-grow">
                <div class="flex items-center gap-1"><span class="text-slate-400 text-xs">$</span><input type="number" oninput="window.autoSave()" placeholder="Annual Amt" class="w-28 bg-white border border-slate-200 p-1.5 rounded font-bold text-right text-sm outline-none"></div>
                <div class="flex flex-col"><label class="text-[8px] font-bold text-slate-400 uppercase">Tax Free Until (Year)</label><input type="number" oninput="window.autoSave()" placeholder="Never" class="w-20 bg-white border border-slate-200 p-1 rounded text-xs outline-none text-center"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="flex flex-col">
                    <div class="flex justify-between text-[9px] font-bold text-slate-500 mb-1 uppercase"><span>Annual Increase</span><span class="text-indigo-600">2%</span></div>
                    <input type="range" min="0" max="10" step="0.5" value="2" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full">
                </div>
                <div class="flex flex-col">
                    <div class="flex justify-between text-[9px] font-bold text-slate-500 mb-1 uppercase"><span>Personal 401k %</span><span class="text-indigo-600">0%</span></div>
                    <input type="range" min="0" max="30" step="1" value="0" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full">
                </div>
                <div class="flex flex-col">
                    <div class="flex justify-between text-[9px] font-bold text-slate-500 mb-1 uppercase"><span>Company Match %</span><span class="text-indigo-600">0%</span></div>
                    <input type="range" min="0" max="20" step="0.5" value="0" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full">
                </div>
            </div>`;
        container.appendChild(div);
    } else if (type === 'other') {
        const div = document.createElement('div');
        div.className = "bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center group shadow-sm";
        div.innerHTML = `
            <input type="text" oninput="window.autoSave()" placeholder="Asset (Tractor, Car, etc.)" class="text-sm font-medium outline-none bg-transparent w-full">
            <input type="number" oninput="window.autoSave()" placeholder="$0" class="w-24 text-right font-bold text-slate-600 outline-none bg-transparent">
            <button onclick="this.parentElement.remove(); window.autoSave()" class="ml-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-minus-circle text-xs"></i></button>`;
        container.appendChild(div);
    }
};

window.toggleCostBasis = (el) => {
    const container = el.closest('tr').querySelector('.cost-basis-container');
    el.value === "Post-Tax (Roth)" ? container.classList.remove('hidden') : container.classList.add('hidden');
};

window.addEventListener('DOMContentLoaded', () => { window.calculateUserAge(); });