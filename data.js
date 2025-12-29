import { calculateNetWorth } from './math.js';

/**
 * IDENTITY & AGE LOGIC
 */
window.calculateUserAge = function() {
    const birthYear = document.getElementById('user-birth-year').value;
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    document.getElementById('display-age').innerText = age;
    return age;
};

/**
 * TAB MANAGEMENT
 */
window.showTab = function(tabId) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    // Reset all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600');
        btn.classList.add('text-slate-500');
    });

    // Show active
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.remove('hidden');
    
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'border-indigo-600', 'text-indigo-600');
        activeBtn.classList.remove('text-slate-500');
    }
};

/**
 * DYNAMIC ROW ENGINE (ASSETS & DEBTS)
 */
const CLASSES = ["401k/IRA", "Roth", "Brokerage", "Cash", "Metals", "Crypto"];

window.addRow = function(containerId, type) {
    const container = document.getElementById(containerId);
    
    if (type === 'housing') {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative group";
        div.innerHTML = `
            <button onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                <i class="fas fa-times"></i>
            </button>
            <input type="text" placeholder="Primary Residence" class="font-bold text-slate-700 outline-none border-b border-transparent focus:border-indigo-300">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Value</label>
                    <input type="number" placeholder="500000" class="w-full font-bold text-slate-600 bg-slate-50 p-2 rounded outline-none focus:ring-1 ring-indigo-200">
                </div>
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Annual Prop Tax</label>
                    <input type="number" placeholder="4500" class="w-full font-bold text-red-500 bg-slate-50 p-2 rounded outline-none focus:ring-1 ring-red-100">
                </div>
            </div>
        `;
        container.appendChild(div);
    } 
    
    else if (type === 'investment') {
        const target = document.getElementById('investment-rows');
        const row = document.createElement('tr');
        row.className = "border-t border-slate-100 hover:bg-slate-50 transition";
        row.innerHTML = `
            <td class="px-4 py-3"><input type="text" placeholder="Account Name" class="bg-transparent outline-none w-full text-slate-700"></td>
            <td class="px-4 py-3">
                <select class="bg-transparent outline-none font-medium text-slate-500 cursor-pointer">
                    ${CLASSES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </td>
            <td class="px-4 py-3"><input type="number" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-slate-700"></td>
            <td class="px-4 py-2 text-right">
                <button onclick="this.closest('tr').remove()" class="text-slate-300 hover:text-red-500 transition"><i class="fas fa-times"></i></button>
            </td>
        `;
        target.appendChild(row);
    }

    else if (type === 'other') {
        const div = document.createElement('div');
        div.className = "bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center group shadow-sm hover:border-indigo-200 transition";
        div.innerHTML = `
            <div class="flex items-center gap-2 flex-grow">
                <button onclick="this.parentElement.parentElement.remove()" class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                    <i class="fas fa-minus-circle"></i>
                </button>
                <input type="text" placeholder="Boat, Tractor, etc." class="text-sm font-medium outline-none bg-transparent w-full">
            </div>
            <input type="number" placeholder="$0" class="w-24 text-right font-bold text-slate-600 outline-none bg-transparent">
        `;
        container.appendChild(div);
    }
};

/**
 * INITIALIZATION
 */
window.onload = () => {
    calculateUserAge();
    // Default starting points
    addRow('housing-list', 'housing');
    addRow('investment-rows', 'investment');
};