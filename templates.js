const templates = {
    investment: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Account Name" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3"><select onchange="window.autoSave()" class="bg-transparent outline-none w-full text-xs text-slate-500">
            <option>Taxable</option>
            <option>Pre-Tax (401k/IRA)</option>
            <option>Post-Tax (Roth)</option>
            <option>HSA</option>
            <option>529 Plan</option>
            <option>Crypto</option>
            <option>Other</option>
        </select></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    
    housing: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Property Name" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-400 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-slate-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    
    other: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Asset Name" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    
    debt: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Debt Name" class="bg-transparent outline-none w-full text-sm font-bold text-red-400"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,

    income: () => `
        <div class="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-4 relative group shadow-sm">
            <button onclick="this.parentElement.remove(); window.autoSave()" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-times text-xs"></i></button>
            <div class="flex flex-wrap gap-4 items-center">
                <input type="text" oninput="window.autoSave()" placeholder="Source Name" class="bg-transparent font-black text-slate-700 outline-none text-sm flex-grow">
                <div class="flex flex-col"><label class="text-[8px] font-bold text-slate-400 uppercase">Base Salary</label><div class="flex items-center gap-1"><span class="text-slate-400 text-xs">$</span><input type="number" oninput="window.autoSave()" class="w-28 bg-white border border-slate-200 p-1 rounded font-bold text-right text-sm"></div></div>
                <div class="flex flex-col"><label class="text-[8px] font-bold text-slate-400 uppercase">Bonus %</label><div class="flex items-center gap-1"><input type="number" oninput="window.autoSave()" class="w-16 bg-white border border-slate-200 p-1 rounded font-bold text-right text-sm"><span>%</span></div></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="flex flex-col"><div class="flex justify-between text-[9px] font-bold text-slate-500 mb-1 uppercase"><span>Annual Increase</span><span class="text-indigo-600">3%</span></div><input type="range" min="0" max="10" step="0.1" value="3" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>401k Personal</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="30" step="1" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"><label class="text-[9px] flex gap-1 items-center"><input type="checkbox" onchange="window.autoSave()"> Include Bonus</label></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>401k Company</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="20" step="0.5" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"><label class="text-[9px] flex gap-1 items-center"><input type="checkbox" onchange="window.autoSave()"> Include Bonus</label></div>
            </div>
        </div>`,

    "savings-item": () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Contribution Name" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3"><select onchange="window.autoSave()" class="bg-transparent outline-none w-full text-xs text-slate-500">
            <option>Post-Tax (Roth)</option>
            <option>Taxable</option>
            <option>HSA</option>
            <option>529 Plan</option>
            <option>Pre-Tax (401k/IRA)</option>
        </select></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-emerald-600 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    
    "budget-item": () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Expense Name" class="bg-transparent outline-none w-full text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-400 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-center"><input type="number" oninput="window.autoSave()" placeholder="N/A" class="w-full text-center outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,

    projectionRow: (row, inflation) => {
        const inflationFactor = Math.pow(1 + inflation / 100, new Date().getFullYear() - (new Date().getFullYear() + (row.age - (new Date().getFullYear() - 1986))));
        return `
            <td class="px-6 py-4 font-bold">${row.age}</td>
            <td class="px-6 py-4 text-right">${math.toCurrency(row.portfolio)}</td>
            <td class="px-6 py-4 text-right">${math.toCurrency(row.realEstate)}</td>
            <td class="px-6 py-4 text-right">${math.toCurrency(row.otherAssets)}</td>
            <td class="px-6 py-4 text-right text-red-500">${math.toCurrency(row.debt)}</td>
            <td class="px-6 py-4 text-right font-black">${math.toCurrency(row.netWorth)}</td>
            <td class="px-6 py-4 text-right text-emerald-600">${math.toCurrency(row.netWorth * inflationFactor)}</td>`;
    }
};