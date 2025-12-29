/**
 * UI & TAB MANAGEMENT
 */
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

/**
 * DYNAMIC ROW ENGINE
 */
const CLASSES = ["401k/IRA", "Roth", "Brokerage", "Cash", "Metals", "Crypto"];

window.addRow = function(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container && type !== 'investment') return;
    
    if (type === 'housing') {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative group";
        div.innerHTML = `
            <button onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                <i class="fas fa-times"></i>
            </button>
            <input type="text" placeholder="Property Name" class="font-bold text-slate-700 outline-none border-b border-transparent focus:border-indigo-300">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Current Value</label>
                    <input type="number" class="w-full font-bold text-slate-600 bg-slate-50 p-2 rounded outline-none">
                </div>
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase">Annual Prop Tax</label>
                    <input type="number" class="w-full font-bold text-red-500 bg-slate-50 p-2 rounded outline-none">
                </div>
            </div>`;
        container.appendChild(div);
    } 
    
    else if (type === 'investment') {
        const target = document.getElementById('investment-rows');
        const row = document.createElement('tr');
        row.className = "border-t border-slate-100 hover:bg-slate-50";
        row.innerHTML = `
            <td class="px-4 py-3"><input type="text" placeholder="Account Name" class="bg-transparent outline-none w-full"></td>
            <td class="px-4 py-3">
                <select class="bg-transparent outline-none font-medium text-slate-500">
                    ${CLASSES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </td>
            <td class="px-4 py-3"><input type="number" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent"></td>
            <td class="px-4 py-2 text-right">
                <button onclick="this.closest('tr').remove()" class="text-slate-300 hover:text-red-500"><i class="fas fa-times"></i></button>
            </td>`;
        target.appendChild(row);
    }

    else if (type === 'other') {
        const div = document.createElement('div');
        div.className = "bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center group";
        div.innerHTML = `
            <input type="text" placeholder="Asset Name" class="text-sm font-medium outline-none bg-transparent w-full">
            <input type="number" placeholder="$0" class="w-24 text-right font-bold text-slate-600 outline-none bg-transparent">
            <button onclick="this.parentElement.remove()" class="ml-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-minus-circle"></i></button>`;
        container.appendChild(div);
    }
};

// Initial setup
window.addEventListener('DOMContentLoaded', () => {
    window.calculateUserAge();
    window.addRow('housing-list', 'housing');
    window.addRow('investment-rows', 'investment');
});