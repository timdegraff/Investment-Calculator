const templates = {
    // Note: oninput events are now added dynamically in core.js

    investment: () => `
        <td class="px-4 py-3"><input data-id="name" type="text" placeholder="e.g., Fidelity Brokerage" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3">
            <select data-id="type" class="bg-transparent outline-none w-full text-sm">
                <option>Taxable</option>
                <option>Pre-Tax (401k/IRA)</option>
                <option>Post-Tax (Roth)</option>
                <option>HSA</option>
                <option>529 Plan</option>
                <option>Cash</option>
                <option>Bitcoin</option>
                <option>Metals</option>
            </select>
        </td>
        <td class="px-4 py-3 text-right"><input data-id="value" type="text" data-type="currency" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm text-emerald-600"></td>
        <td class="px-4 py-3 text-right cost-basis-cell hidden"><input data-id="costBasis" type="text" data-type="currency" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm text-blue-400"></td>
        <td class="px-4 py-2 text-center"><button onclick="this.closest('tr').remove(); window.autoSave(); window.updateCostBasisHeaderVisibility();" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6"><i class="fas fa-times"></i></button></td>`,
    
    heloc: () => `
        <td class="px-4 py-3"><input data-id="name" type="text" placeholder="e.g., Chase HELOC" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input data-id="balance" type="text" data-type="currency" placeholder="0" class="w-full text-right font-bold text-red-400 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input data-id="limit" type="text" data-type="currency" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input data-id="rate" type="number" placeholder="5.0" class="w-20 text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-center"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6"><i class="fas fa-times"></i></button></td>`,

    debt: () => `
        <td class="px-4 py-3"><input data-id="name" type="text" placeholder="e.g., Credit Card" class="bg-transparent outline-none w-full text-sm font-bold text-red-400"></td>
        <td class="px-4 py-3 text-right"><input data-id="balance" type="text" data-type="currency" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input data-id="rate" type="number" placeholder="22.9" class="w-20 text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-center"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6"><i class="fas fa-times"></i></button></td>`,

    income: () => `
    <div class="income-card p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-4 relative group">
        <button onclick="this.parentElement.remove(); window.autoSave()" class="absolute top-3 right-3 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-times text-sm"></i></button>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 items-end">
            <div class="col-span-2 md:col-span-1">
                <label class="text-xs font-bold text-slate-400 uppercase">Source Name</label>
                <input data-id="name" type="text" placeholder="e.g., W2 Job" class="bg-transparent font-bold text-lg text-white outline-none w-full mt-1">
            </div>
            <div>
                <label class="text-xs font-bold text-slate-400 uppercase">Base Salary</label>
                <div class="flex items-center mt-1">
                    <span class="text-slate-400 text-lg mr-2">$</span>
                    <input data-id="amount" type="text" data-type="currency" value="0" class="w-full bg-slate-700/50 border border-slate-600 px-2 py-1.5 rounded font-bold text-right text-lg text-white">
                </div>
            </div>
            <div>
                <label class="text-xs font-bold text-slate-400 uppercase">Avg Bonus</label>
                <div class="flex items-center mt-1">
                    <input data-id="bonusPct" type="number" value="0" class="w-full bg-slate-700/50 border border-slate-600 px-2 py-1.5 rounded font-bold text-right text-lg text-white">
                    <span class="text-slate-400 text-lg ml-2">%</span>
                </div>
            </div>
            <div>
                <label class="text-xs font-bold text-slate-400 uppercase">Non-Taxable Until</label>
                <input data-id="nonTaxYear" type="number" placeholder="Year" class="w-full bg-slate-700/50 border border-slate-600 px-2 py-1.5 rounded font-bold text-right text-lg text-white mt-1">
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pt-4 border-t border-slate-700/60">
            <div>
                <div class="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                    <span>Annual Increase</span>
                    <span class="font-bold text-blue-400">0%</span>
                </div>
                <input data-id="increase" type="range" min="0" max="10" step="0.1" value="3" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-blue-500">
            </div>
            <div>
                 <div class="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                    <span>401k Contribution</span>
                    <span class="font-bold text-blue-400">0%</span>
                </div>
                <input data-id="contribution" type="range" min="0" max="30" step="1" value="0" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-blue-500">
                <label class="text-sm flex gap-2 items-center text-slate-400 mt-2"><input data-id="contribIncBonus" type="checkbox"> Include Bonus</label>
            </div>
            <div>
                 <div class="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                    <span>Employer Match</span>
                    <span class="font-bold text-blue-400">0%</span>
                </div>
                <input data-id="match" type="range" min="0" max="20" step="0.5" value="0" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-blue-500">
                <label class="text-sm flex gap-2 items-center text-slate-400 mt-2"><input data-id="matchIncBonus" type="checkbox"> Include Bonus</label>
            </div>
        </div>
    </div>`,

    "savings-item": () => `
        <td class="px-4 py-3"><input data-id="name" type="text" placeholder="e.g., Roth IRA" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input data-id="balance" type="text" data-type="currency" placeholder="0" class="w-full text-right font-bold text-emerald-600 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input data-id="contribution" type="text" data-type="currency" placeholder="0" class="w-full text-right font-bold text-emerald-600 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-center"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6"><i class="fas fa-times"></i></button></td>`,
    
    "budget-item": () => `
        <td class="px-4 py-3"><input data-id="name" type="text" placeholder="e.g., Groceries" class="bg-transparent outline-none w-full text-sm"></td>
        <td class="px-4 py-3 text-right"><div class="flex items-center"><span class="text-slate-400 text-sm mr-1">$</span><input data-id="monthly" type="text" data-type="currency" placeholder="0" class="w-full text-right font-bold text-red-400 outline-none bg-transparent text-sm"></div></td>
        <td class="px-4 py-3 text-right"><div class="flex items-center"><span class="text-slate-400 text-sm mr-1">$</span><input data-id="annual" type="text" data-type="currency" placeholder="0" class="w-full text-right font-bold text-red-400 outline-none bg-transparent text-sm"></div></td>
        <td class="px-4 py-2 text-center"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6"><i class="fas fa-times"></i></button></td>`,
};