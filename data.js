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
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    const display = document.getElementById('display-age');
    if (display) display.innerText = age;
};

const CLASSES = ["401k/IRA", "Roth", "Brokerage", "Cash", "Metals", "Crypto"];

window.addRow = function(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (type === 'housing') {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative group";
        div.innerHTML = `
            <button onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-times"></i></button>
            <input type="text" placeholder="Property Name" class="font-bold text-slate-700 outline-none border-b border-transparent focus:border-indigo-300">
            <div class="grid grid-cols-3 gap-3">
                <div>
                    <label class="text-[9px] font-bold text-slate-400 uppercase">Current Value</label>
                    <input type="number" class="w-full font-bold text-slate-600 bg-slate-50 p-2 rounded outline-none text-sm">
                </div>
                <div>
                    <label class="text-[9px] font-bold text-slate-400 uppercase">Mortgage</label>
                    <input type="number" class="w-full font-bold text-red-400 bg-slate-50 p-2 rounded outline-none text-sm">
                </div>
                <div>
                    <label class="text-[9px] font-bold text-slate-400 uppercase">Prop Tax (Yearly)</label>
                    <input type="number" class="w-full font-bold text-slate-500 bg-slate-50 p-2 rounded outline-none text-sm">
                </div>
            </div>`;
        container.appendChild(div);
    } 
    
    else if (type === 'investment') {
        const row = document.createElement('tr');
        row.className = "border-t border-slate-100 hover:bg-slate-50";
        row.innerHTML = `
            <td class="px-4 py-3"><input type="text" placeholder="Account Name" class="bg-transparent outline-none w-full text-sm"></td>
            <td class="px-4 py-3">
                <select class="bg-transparent outline-none font-medium text-slate-500 text-xs">
                    ${CLASSES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </td>
            <td class="px-4 py-3"><input type="number" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
            <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`;
        container.appendChild(row);
    }

    else if (type === 'income') {
        const div = document.createElement('div');
        div.className = "flex items-center gap-3 p-3 bg-slate-50 rounded-lg group";
        div.innerHTML = `
            <input type="text" placeholder="Salary, Bonus, etc." class="flex-grow bg-transparent font-bold text-slate-700 outline-none text-sm">
            <div class="flex items-center gap-1">
                <span class="text-slate-400 text-xs">$</span>
                <input type="number" placeholder="0" class="w-24 bg-transparent font-black text-slate-700 outline-none text-right text-sm">
            </div>
            <button onclick="this.parentElement.remove()" class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-minus-circle text-xs"></i></button>
        `;
        container.appendChild(div);
    }

    else if (type === 'other') {
        const div = document.createElement('div');
        div.className = "bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center group shadow-sm";
        div.innerHTML = `
            <input type="text" placeholder="Asset Name" class="text-sm font-medium outline-none bg-transparent w-full">
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