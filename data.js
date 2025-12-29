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
        otherAssets: Array.from(document.querySelectorAll('#other-assets-list tr')).map(row => ({
            name: row.cells[0].querySelector('input').value,
            value: row.cells[1].querySelector('input').value
        })),
        realEstate: Array.from(document.querySelectorAll('#housing-list tr')).map(row => ({
            name: row.cells[0].querySelector('input').value,
            value: row.cells[1].querySelector('input').value,
            mortgage: row.cells[2].querySelector('input').value,
            tax: row.cells[3].querySelector('input').value
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

window.addRow = (containerId, type) => {
    const container = document.getElementById(containerId);
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
    } else if (type === 'other') {
        const row = document.createElement('tr');
        row.className = "border-t border-slate-100";
        row.innerHTML = `
            <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Asset Name" class="bg-transparent outline-none w-full text-sm"></td>
            <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-slate-600 outline-none bg-transparent text-sm"></td>
            <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`;
        container.appendChild(row);
    } else if (type === 'housing') {
        const row = document.createElement('tr');
        row.className = "border-t border-slate-100";
        row.innerHTML = `
            <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Property Name" class="bg-transparent outline-none w-full text-sm font-bold text-slate-700"></td>
            <td class="px-4 py-3"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-slate-600 outline-none bg-transparent text-sm"></td>
            <td class="px-4 py-3"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-400 outline-none bg-transparent text-sm"></td>
            <td class="px-4 py-3"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-slate-500 outline-none bg-transparent text-sm"></td>
            <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`;
        container.appendChild(row);
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
    }
};

window.toggleCostBasis = (el) => {
    const container = el.closest('tr').querySelector('.cost-basis-container');
    el.value === "Post-Tax (Roth)" ? container.classList.remove('hidden') : container.classList.add('hidden');
};

window.addEventListener('DOMContentLoaded', () => { window.calculateUserAge(); });