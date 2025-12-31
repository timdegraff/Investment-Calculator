export const templates = {
    investment: () => `
        <td class="pl-2 pr-1 py-2 w-8"><i class="fas fa-bars text-slate-500 cursor-move drag-handle"></i></td>
        <td class="px-4 py-2"><input data-id="name" type="text" placeholder="e.g., Fidelity Brokerage" class="input-base w-full"></td>
        <td class="px-4 py-2">
            <select data-id="type" class="input-base w-full">
                <option>Taxable</option>
                <option>Pre-Tax (401k/IRA)</option>
                <option>Post-Tax (Roth)</option>
                <option>HSA</option>
                <option>529 Plan</option>
                <option>Cash</option>
                <option>Crypto</option>
                <option>Metals</option>
            </select>
        </td>
        <td class="px-4 py-2"><input data-id="value" type="text" data-type="currency" placeholder="$0" class="input-base w-full text-right text-teal-400"></td>
        <td class="px-4 py-2"><input data-id="costBasis" type="text" data-type="currency" placeholder="N/A" class="input-base w-full text-right text-blue-400 disabled:text-slate-500 disabled:cursor-not-allowed"></td>
        <td class="px-4 py-2 text-center"><button data-action="remove" class="btn-icon"><i class="fas fa-times"></i></button></td>`,
    
    heloc: () => `
        <td class="px-4 py-2"><input data-id="name" type="text" placeholder="e.g., Chase HELOC" class="input-base w-full"></td>
        <td class="px-4 py-2"><input data-id="balance" type="text" data-type="currency" placeholder="$0" class="input-base w-full text-right text-pink-500"></td>
        <td class="px-4 py-2"><input data-id="limit" type="text" data-type="currency" placeholder="$0" class="input-base w-full text-right"></td>
        <td class="px-4 py-2"><input data-id="rate" type="number" placeholder="5.0" class="input-base w-24 text-right"></td>
        <td class="px-4 py-2 text-center"><button data-action="remove" class="btn-icon"><i class="fas fa-times"></i></button></td>`,

    debt: () => `
        <td class="px-4 py-2"><input data-id="name" type="text" placeholder="e.g., Credit Card" class="input-base w-full"></td>
        <td class="px-4 py-2"><input data-id="balance" type="text" data-type="currency" placeholder="$0" class="input-base w-full text-right text-pink-500"></td>
        <td class="px-4 py-2"><input data-id="rate" type="number" placeholder="22.9" class="input-base w-24 text-right"></td>
        <td class="px-4 py-2 text-center"><button data-action="remove" class="btn-icon"><i class="fas fa-times"></i></button></td>`,

    income: () => `
        <div class="space-y-4 relative group">
            <button data-action="remove" class="btn-icon absolute top-2 right-2 opacity-50 group-hover:opacity-100"><i class="fas fa-times"></i></button>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="col-span-2 md:col-span-1">
                    <label class="label-form">Source Name</label>
                    <input data-id="name" type="text" placeholder="e.g., W2 Job" class="input-base w-full font-bold">
                </div>
                <div>
                    <label class="label-form">Base Salary</label>
                    <input data-id="amount" type="text" data-type="currency" value="$0" class="input-base w-full text-right text-teal-400">
                </div>
                <div>
                    <label class="label-form">Avg Bonus</label>
                     <div class="relative">
                        <input data-id="bonusPct" type="text" value="0" class="input-base w-full text-right pr-6">
                        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                    </div>
                </div>
                <div>
                    <label class="label-form">Non-Taxable Until</label>
                    <input data-id="nonTaxYear" type="number" placeholder="Year" class="input-base w-full text-right">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                <div>
                    <label class="label-form flex justify-between">Annual Increase <span>0%</span></label>
                    <input data-id="increase" type="range" min="0" max="10" step="0.1" value="3" class="input-range">
                </div>
                <div>
                    <label class="label-form flex justify-between">401k Contribution <span>0%</span></label>
                    <input data-id="contribution" type="range" min="0" max="30" step="1" value="0" class="input-range">
                </div>
                <div>
                    <label class="label-form flex justify-between">Employer Match <span>0%</span></label>
                    <input data-id="match" type="range" min="0" max="20" step="0.5" value="0" class="input-range">
                </div>
            </div>
            <div class="flex justify-between items-center pt-4 border-t border-slate-700">
                 <label class="flex items-center gap-2 text-sm text-slate-300"><input data-id="contribIncBonus" type="checkbox" class="checkbox-base"> Include Bonus in 401k Contrib.</label>
                 <label class="flex items-center gap-2 text-sm text-slate-300"><input data-id="matchIncBonus" type="checkbox" class="checkbox-base"> Include Bonus in Match</label>
                 <label class="flex items-center gap-2 text-sm text-slate-300"><input data-id="remainsInRetirement" type="checkbox" class="checkbox-base"> Remains in Retirement?</label>
            </div>
        </div>`,

    "budget-savings": () => `
        <td class="px-4 py-2"><input data-id="name" type="text" placeholder="e.g., Roth IRA" class="input-base w-full"></td>
        <td class="px-4 py-2"><input data-id="contribution" type="text" data-type="currency" placeholder="$0" class="input-base w-full text-right text-teal-400"></td>
        <td class="px-4 py-2 text-center"><button data-action="remove" class="btn-icon"><i class="fas fa-times"></i></button></td>`,
    
    "budget-expense": () => `
        <td class="px-4 py-2"><input data-id="name" type="text" placeholder="e.g., Groceries" class="input-base w-full"></td>
        <td class="px-4 py-2"><input data-id="monthly" data-type="currency" type="text" placeholder="$0" class="input-base w-full text-right text-pink-500"></td>
        <td class="px-4 py-2"><input data-id="annual" data-type="currency" type="text" placeholder="$0" class="input-base w-full text-right text-pink-500"></td>
        <td class="px-4 py-2 text-center"><button data-action="remove" class="btn-icon"><i class="fas fa-times"></i></button></td>`,
};