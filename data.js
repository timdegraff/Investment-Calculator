window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600');
        btn.classList.add('text-slate-500');
    });
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.remove('hidden');
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'border-indigo-600', 'text-indigo-600');
        activeBtn.classList.remove('text-slate-500');
    }
};

window.calculateUserAge = function() {
    const birthYear = document.getElementById('user-birth-year').value;
    const age = new Date().getFullYear() - birthYear;
    const display = document.getElementById('display-age');
    if (display) display.innerText = age;
};

const INVEST_CLASSES = ["Taxable", "Pre-Tax (401k/IRA)", "Post-Tax (Roth)", "529 Plan", "Cash/Physical"];

window.addRow = function(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (type === 'housing') {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative group";
        div.innerHTML = `
            <button onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-times"></i></button>
            <input type="text" placeholder="Property Description" class="font-bold text-slate-700 outline-none border-b border-transparent focus:border-indigo-300">
            <div class="grid grid-cols-3 gap-3">
                <div><label class="text-[9px] font-bold text-slate-400 uppercase">Value</label><input type="number" class="w-full font-bold text-slate-600 bg-slate-50 p-2 rounded outline-none text-sm"></div>
                <div><label class="text-[9px] font-bold text-slate-400 uppercase">Mortgage</label><input type="number" class="w-full font-bold text-red-400 bg-slate-50 p-2 rounded outline-none text-sm"></div>
                <div><label class="text-[9px] font-bold text-slate-400 uppercase">Tax/Ins (Yearly)</label><input type="number" class="w-full font-bold text-slate-500 bg-slate-50 p-2 rounded outline-none text-sm"></div>
            </div>`;
        container.appendChild(div);
    } 
    
    else if (type === 'investment') {
        const row = document.createElement('tr');
        row.className = "border-t border-slate-100 hover:bg-slate-50";
        row.innerHTML = `
            <td class="px-4 py-3"><input type="text" placeholder="Account" class="bg-transparent outline-none w-full text-sm"></td>
            <td class="px-4 py-3">
                <select class="bg-transparent outline-none font-medium text-slate-500 text-xs">
                    ${INVEST_CLASSES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </td>
            <td class="px-4 py-3"><input type="number" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
            <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`;
        container.appendChild(row);
    }

    else if (type === 'income') {
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4 relative group";
        div.innerHTML = `
            <button onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-times text-xs"></i></button>
            <div class="flex flex-wrap gap-4 items-center">
                <input type="text" placeholder="Income Name" class="bg-transparent font-black text-slate-700 outline-none text-sm flex-grow">
                <div class="flex items-center gap-1"><span class="text-slate-400 text-xs">$</span><input type="number" placeholder="Annual Amt" class="w-28 bg-white border border-slate-200 p-1.5 rounded font-bold text-right text-sm outline-none"></div>
                <div class="flex flex-col"><label class="text-[8px] font-bold text-slate-400 uppercase">Tax Free Until (Year)</label><input type="number" placeholder="Never" class="w-20 bg-white border border-slate-200 p-1 rounded text-xs outline-none"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="flex flex-col">
                    <div class="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase"><span>Annual Increase</span><span id="inc-val-0">%</span></div>
                    <input type="range" min="0" max="10" step="0.5" value="2" class="w-full" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'">
                </div>
                <div class="flex flex-col">
                    <div class="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase"><span>Personal 401k %</span><span id="cont-val-0">%</span></div>
                    <input type="range" min="0" max="30" step="1" value="0" class="w-full" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'">
                </div>
                <div class="flex flex-col">
                    <div class="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase"><span>Company Match %</span><span id="match-val-0">%</span></div>
                    <input type="range" min="0" max="20" step="0.5" value="0" class="w-full" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'">
                </div>
            </div>`;
        container.appendChild(div);
    }

    else if (type === 'other') {
        const div = document.createElement('div');
        div.className = "bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center group shadow-sm";
        div.innerHTML = `
            <input type="text" placeholder="Asset (Tractor, Car, etc.)" class="text-sm font-medium outline-none bg-transparent w-full">
            <input type="number" placeholder="$0" class="w-24 text-right font-bold text-slate-600 outline-none bg-transparent">
            <button onclick="this.parentElement.remove()" class="ml-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-minus-circle"></i></button>`;
        container.appendChild(div);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.calculateUserAge();
    window.addRow('investment-rows', 'investment');
    window.addRow('other-assets-list', 'other');
    window.addRow('housing-list', 'housing');
    window.addRow('income-list', 'income');
});