const templates = {
    // Note: oninput events are now added dynamically in core.js

    investment: () => `
        <td class="px-4 py-3"><input data-id="name" type="text" placeholder="e.g., Fidelity Brokerage" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3">
            <select data-id="class" class="bg-transparent outline-none w-full text-xs text-slate-500">
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
        <td class="px-4 py-3 text-right"><input data-id="value" type="number" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-center"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6"><i class="fas fa-times"></i></button></td>`,
    
    housing: () => `
        <td class="px-4 py-3"><input data-id="name" type="text" placeholder="e.g., Primary Home" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input data-id="value" type="number" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input data-id="debt" type="number" placeholder="0" class="w-full text-right font-bold text-red-400 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-center"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6"><i class="fas fa-times"></i></button></td>`,
    
    other: () => `
        <td class="px-4 py-3"><input data-id="name" type="text" placeholder="e.g., Vehicle" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input data-id="value" type="number" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input data-id="debt" type="number" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-center"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6"><i class="fas fa-times"></i></button></td>`,
    
    debt: () => `
        <td class="px-4 py-3"><input data-id="name" type="text" placeholder="e.g., Credit Card" class="bg-transparent outline-none w-full text-sm font-bold text-red-400"></td>
        <td class="px-4 py-3 text-right"><input data-id="balance" type="number" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-center"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6"><i class="fas fa-times"></i></button></td>`,

    income: () => `
        <div class="income-card p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 relative group">
            <button onclick="this.parentElement.remove(); window.autoSave()" class="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-times text-xs"></i></button>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                <div class="col-span-2 md:col-span-1"><label class="text-[9px] font-bold text-slate-400 uppercase">Source Name</label><input data-id="name" type="text" placeholder="e.g., W2 Job" class="bg-transparent font-bold text-slate-800 outline-none text-sm w-full"></div>
                <div><label class="text-[9px] font-bold text-slate-400 uppercase">Base Salary</label><div class="flex items-center"><span class="text-slate-400 text-sm mr-1">$</span><input data-id="amount" type="number" value="0" class="w-full bg-white border border-slate-200 p-1 rounded font-bold text-right text-sm"></div></div>
                <div><label class="text-[9px] font-bold text-slate-400 uppercase">Avg Bonus</label><div class="flex items-center"><input data-id="bonusPct" type="number" value="0" class="w-full bg-white border border-slate-200 p-1 rounded font-bold text-right text-sm"><span class="text-slate-400 text-sm ml-1">%</span></div></div>
                <div><label class="text-[9px] font-bold text-slate-400 uppercase">Non-Taxable Until</label><input data-id="nonTaxYear" type="number" placeholder="Year" class="w-full bg-white border border-slate-200 p-1 rounded font-bold text-right text-sm"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 pt-2 border-t border-slate-200/60">
                <div class="flex flex-col"><div class="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1"><span>Annual Increase</span><span class="font-bold text-indigo-600">3%</span></div><input data-id="increase" type="range" min="0" max="10" step="0.1" value="3" class="w-full accent-indigo-600"></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>401k Contribution</span><span class="font-bold text-indigo-600">0%</span></div><input data-id="contribution" type="range" min="0" max="30" step="1" value="0" class="w-full accent-indigo-600"><label class="text-[10px] flex gap-1.5 items-center text-slate-500"><input data-id="contribIncBonus" type="checkbox"> Include Bonus</label></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>Employer Match</span><span class="font-bold text-indigo-600">0%</span></div><input data-id="match" type="range" min="0" max="20" step="0.5" value="0" class="w-full accent-indigo-600"><label class="text-[10px] flex gap-1.5 items-center text-slate-500"><input data-id="matchIncBonus" type="checkbox"> Include Bonus</label></div>
            </div>
        </div>`,

    "savings-item": () => `
        <td class="px-4 py-3"><input data-id="name" type="text" placeholder="e.g., Roth IRA" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3">
            <select data-id="class" class="bg-transparent outline-none w-full text-xs text-slate-500">
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
        <td class="px-4 py-3 text-right"><div class="flex items-center"><span class="text-slate-400 text-sm mr-1">$</span><input data-id="monthly" type="number" placeholder="0" class="w-full text-right font-bold text-emerald-600 outline-none bg-transparent text-sm"></div></td>
        <td class="px-4 py-3 text-right"><div class="flex items-center"><span class="text-slate-400 text-sm mr-1">$</span><input data-id="annual" type="number" placeholder="0" class="w-full text-right font-bold text-emerald-600 outline-none bg-transparent text-sm"></div></td>
        <td class="px-4 py-2 text-center"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6"><i class="fas fa-times"></i></button></td>`,
    
    "budget-item": () => `
        <td class="px-4 py-3"><input data-id="name" type="text" placeholder="e.g., Groceries" class="bg-transparent outline-none w-full text-sm"></td>
        <td class="px-4 py-3 text-right"><div class="flex items-center"><span class="text-slate-400 text-sm mr-1">$</span><input data-id="monthly" type="number" placeholder="0" class="w-full text-right font-bold text-red-400 outline-none bg-transparent text-sm"></div></td>
        <td class="px-4 py-3 text-right"><div class="flex items-center"><span class="text-slate-400 text-sm mr-1">$</span><input data-id="annual" type="number" placeholder="0" class="w-full text-right font-bold text-red-400 outline-none bg-transparent text-sm"></div></td>
        <td class="px-4 py-2 text-center"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-300 hover:text-red-500 text-xs w-6 h-6"><i class="fas fa-times"></i></button></td>`,

    projectionRow: (row, assumptions) => {
        const currentAge = new Date().getFullYear() - assumptions.birthYear;
        const yearsFromNow = row.age - currentAge;
        const todaysValue = row.netWorth / Math.pow(1 + (assumptions.inflation / 100), yearsFromNow);

        const format = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

        return `
            <td class="px-6 py-4 font-bold text-slate-700">${row.age}</td>
            <td class="px-6 py-4 text-right">${format(row.portfolio)}</td>
            <td class="px-6 py-4 text-right">${format(row.realEstate)}</td>
            <td class="px-6 py-4 text-right">${format(row.otherAssets)}</td>
            <td class="px-6 py-4 text-right text-red-500">${format(row.debt)}</td>
            <td class="px-6 py-4 text-right font-black text-slate-800">${format(row.netWorth)}</td>
            <td class="px-6 py-4 text-right font-bold text-emerald-600">${format(todaysValue)}</td>`;
    }
};