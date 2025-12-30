let growthChart = null;

// --- UI TEMPLATES ---
const templates = {
    investment: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Account" class="bg-transparent outline-none w-full text-sm"></td>
        <td class="px-4 py-3"><select onchange="window.autoSave()" class="bg-transparent outline-none text-xs text-slate-500">
            <option>Taxable</option><option>Pre-Tax (401k/IRA)</option><option>Post-Tax (Roth)</option><option>HSA</option><option>529 Plan</option><option>Metals</option><option>Crypto</option><option>Cash/Physical</option></select></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    housing: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Address" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-slate-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    other: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Asset" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    debt: () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Debt Name" class="bg-transparent outline-none w-full text-sm font-bold text-slate-700"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-red-500 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    income: () => `
        <div class="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-4 relative group shadow-sm">
            <button onclick="this.parentElement.remove(); window.autoSave()" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-times text-xs"></i></button>
            <div class="flex flex-wrap gap-4 items-center">
                <input type="text" oninput="window.autoSave()" placeholder="Source Name" class="bg-transparent font-black text-slate-700 outline-none text-sm flex-grow">
                <div class="flex flex-col"><label class="text-xs font-bold text-slate-400 uppercase">Base Salary</label><div class="flex items-center gap-1"><span class="text-slate-400 text-sm">$</span><input type="number" oninput="window.autoSave()" class="w-28 bg-white border border-slate-200 p-1 rounded font-bold text-right text-sm"></div></div>
                <div class="flex flex-col"><label class="text-xs font-bold text-slate-400 uppercase">Bonus %</label><div class="flex items-center gap-1"><input type="number" oninput="window.autoSave()" class="w-16 bg-white border border-slate-200 p-1 rounded font-bold text-right text-sm"><span>%</span></div></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="flex flex-col"><div class="flex justify-between text-sm font-bold text-slate-500 mb-1 uppercase"><span>Annual Increase</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="10" step="0.1" value="0" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-sm font-bold text-slate-500 uppercase"><span>401k Personal</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="30" step="1" value="0" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"></div>
                <div class="flex flex-col gap-1"><div class="flex justify-between text-sm font-bold text-slate-500 uppercase"><span>401k Match</span><span class="text-indigo-600">0%</span></div><input type="range" min="0" max="20" step="0.5" value="0" oninput="this.previousElementSibling.lastElementChild.innerText = this.value + '%'; window.autoSave()" class="w-full"></div>
            </div>
        </div>`,
    "savings-item": () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Contribution" class="bg-transparent outline-none w-full text-sm font-bold"></td>
        <td class="px-4 py-3"><select onchange="window.autoSave()" class="bg-transparent outline-none text-xs text-slate-500">
            <option>Taxable</option><option>Roth</option><option>HSA</option><option>529 Plan</option><option>Metals</option><option>Crypto</option></select></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-emerald-600 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`,
    "budget-item": () => `
        <td class="px-4 py-3"><input type="text" oninput="window.autoSave()" placeholder="Expense" class="bg-transparent outline-none w-full text-sm"></td>
        <td class="px-4 py-3 text-right"><input type="number" oninput="window.autoSave()" placeholder="0" class="w-full text-right font-bold text-indigo-600 outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-3 text-center"><input type="number" oninput="window.autoSave()" placeholder="N/A" class="w-full text-center outline-none bg-transparent text-sm"></td>
        <td class="px-4 py-2 text-right"><button onclick="this.closest('tr').remove(); window.autoSave()" class="text-slate-200 hover:text-red-500"><i class="fas fa-times text-xs"></i></button></td>`
};

const engine = {
    formatCompact: (val) => {
        if (!val || isNaN(val)) return "$0";
        const abs = Math.round(Math.abs(val));
        const sign = val < 0 ? "-" : "";
        if (abs >= 1000000) return sign + "$" + (abs / 1000000).toFixed(2) + "M";
        if (abs >= 1000) return sign + "$" + (abs / 1000).toFixed(1) + "K";
        return sign + "$" + abs;
    },

    runProjection: (data) => {
        const startAge = new Date().getFullYear() - (data.birthYear || 1986);
        const retAge = Number(data.retAge || 55);
        const labels = [], invData = [], reData = [], otherData = [], debtData = [], nwData = [];
        
        let currentInv = data.investments.reduce((a, b) => a + Number(b.balance || 0), 0);
        let currentRE = data.realEstate.reduce((a, b) => a + Number(b.value || 0), 0);
        let currentOther = data.otherAssets.reduce((a, b) => a + Number(b.value || 0), 0);
        let currentDebt = (data.realEstate.reduce((a, b) => a + Number(b.mortgage || 0), 0)) +
                          (data.otherAssets.reduce((a, b) => a + Number(b.debt || 0), 0)) +
                          (data.debts.reduce((a, b) => a + Number(b.balance || 0), 0));

        const stockG = 1 + (data.stockGrowth / 100);
        const reG = 1 + (data.reAppreciation / 100);

        const tableBody = document.getElementById('projection-table-body');
        if (tableBody) tableBody.innerHTML = '';

        for (let age = startAge; age <= 100; age++) {
            const isRetired = age >= retAge;
            
            currentInv *= stockG;
            currentRE *= reG;
            // Other assets flat per instructions

            if (!isRetired) {
                data.income.forEach(inc => {
                    const totalSal = Number(inc.amount || 0) * (1 + (Number(inc.bonusPct || 0) / 100));
                    const annualContribution = totalSal * ((Number(inc.contribution || 0) + Number(inc.match || 0)) / 100);
                    currentInv += annualContribution;
                });
                data.savings.forEach(s => currentInv += Number(s.amount || 0));
            } else {
                const drawRate = age < 55 ? (data.drawEarly / 100) : (data.drawLate / 100);
                currentInv -= (currentInv * drawRate);
            }

            currentDebt *= 0.90; // Assume 10% principal paydown annually for simplicity

            const netWorth = (currentInv + currentRE + currentOther) - currentDebt;

            labels.push(age);
            invData.push(Math.round(currentInv));
            reData.push(Math.round(currentRE));
            otherData.push(Math.round(currentOther));
            debtData.push(Math.round(-currentDebt));
            nwData.push(Math.round(netWorth));

            if (tableBody && (age % 5 === 0 || age === startAge || age === 100)) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td class="px-4 py-2 font-bold">${age}</td><td class="px-4 py-2 text-right">${engine.formatCompact(currentInv)}</td><td class="px-4 py-2 text-right">${engine.formatCompact(currentRE)}</td><td class="px-4 py-2 text-right">${engine.formatCompact(currentOther)}</td><td class="px-4 py-2 text-right text-red-500">${engine.formatCompact(currentDebt)}</td><td class="px-4 py-2 text-right font-black text-indigo-600">${engine.formatCompact(netWorth)}</td>`;
                tableBody.appendChild(tr);
            }
        }
        engine.renderChart(labels, invData, reData, otherData, debtData, nwData);
    },

    renderChart: (labels, inv, re, other, debt, nw) => {
        const ctx = document.getElementById('growthChart')?.getContext('2d');
        if (!ctx) return;
        if (growthChart) growthChart.destroy();
        
        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Investments', data: inv, fill: true, backgroundColor: 'rgba(79, 70, 229, 0.7)', borderColor: 'transparent', pointRadius: 0, stack: 'assets' },
                    { label: 'Real Estate', data: re, fill: true, backgroundColor: 'rgba(16, 185, 129, 0.7)', borderColor: 'transparent', pointRadius: 0, stack: 'assets' },
                    { label: 'Other Assets', data: other, fill: true, backgroundColor: 'rgba(245, 158, 11, 0.7)', borderColor: 'transparent', pointRadius: 0, stack: 'assets' },
                    { label: 'Debt', data: debt, fill: true, backgroundColor: 'rgba(239, 68, 68, 0.5)', borderColor: 'transparent', pointRadius: 0, stack: 'assets' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (ctx) => ctx.datasetIndex === 0 ? `Net Worth: ${engine.formatCompact(nw[ctx.dataIndex])}` : null
                        }
                    },
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { stacked: false, ticks: { callback: (v) => engine.formatCompact(v) } }
                }
            }
        });
    },

    updateSummary: (data) => {
        const assets = (data.investments?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0) +
                       (data.realEstate?.reduce((a, b) => a + Number(b.value || 0), 0) || 0) +
                       (data.otherAssets?.reduce((a, b) => a + Number(b.value || 0), 0) || 0);
        const liabilities = (data.realEstate?.reduce((a, b) => a + Number(b.mortgage || 0), 0) || 0) +
                            (data.otherAssets?.reduce((a, b) => a + Number(b.debt || 0), 0) || 0) +
                            (data.debts?.reduce((a, b) => a + Number(b.balance || 0), 0) || 0);
        
        let grossTotal = 0, total401k = 0;
        data.income?.forEach(inc => {
            const base = Number(inc.amount || 0), bonus = base * (Number(inc.bonusPct || 0) / 100);
            grossTotal += (base + bonus);
            total401k += (base + bonus) * ((Number(inc.contribution || 0) + Number(inc.match || 0)) / 100);
        });

        const annualSavings = data.savings?.reduce((a, b) => a + Number(b.amount || 0), 0) || 0;

        document.getElementById('sum-assets').innerText = engine.formatCompact(assets);
        document.getElementById('sum-liabilities').innerText = engine.formatCompact(liabilities);
        document.getElementById('sum-networth').innerText = engine.formatCompact(assets - liabilities);
        document.getElementById('sum-income').innerText = engine.formatCompact(grossTotal);
        document.getElementById('sum-savings').innerText = engine.formatCompact(total401k + annualSavings);
        
        engine.runProjection(data);
    }
};

window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600'));
    document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
    document.getElementById(`btn-${tabId}`)?.classList.add('active', 'border-indigo-600', 'text-indigo-600');
    if (tabId === 'growth') engine.runProjection(window.currentData);
};

window.addRow = (containerId, type, data = null) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const row = document.createElement(type === 'income' ? 'div' : 'tr');
    if (type !== 'income') row.className = "border-t border-slate-100";
    row.innerHTML = templates[type]();
    container.appendChild(row);
    if (data) fillRow(row, type, data);
    return row;
};

function fillRow(row, type, data) {
    if (type === 'income') {
        row.querySelector('input[placeholder="Source Name"]').value = data.name || '';
        const nums = row.querySelectorAll('input[type=number]');
        nums[0].value = data.amount || 0; nums[1].value = data.bonusPct || 0;
        const ranges = row.querySelectorAll('input[type=range]');
        ranges[0].value = data.increase || 0; ranges[1].value = data.contribution || 0; ranges[2].value = data.match || 0;
        ranges.forEach(r => r.previousElementSibling.lastElementChild.innerText = r.value + '%');
    } else {
        const inputs = row.querySelectorAll('input');
        if (inputs[0]) inputs[0].value = data.name || data.address || '';
        if (inputs[1]) inputs[1].value = data.balance || data.value || data.amount || 0;
        if (inputs[2]) inputs[2].value = data.mortgage || data.debt || data.endYear || 0;
        if (inputs[3]) inputs[3].value = data.tax || 0;
        const select = row.querySelector('select');
        if (select && data.class) select.value = data.class;
    }
}

window.calculateUserAge = () => {
    const val = document.getElementById('user-birth-year').value;
    document.getElementById('display-age').innerText = (new Date().getFullYear() - val) + " YRS OLD";
    window.autoSave();
};

window.autoSave = () => {
    const data = {
        birthYear: document.getElementById('user-birth-year').value,
        inflation: document.getElementById('input-inflation').value,
        stockGrowth: document.getElementById('input-stock').value,
        reAppreciation: document.getElementById('input-re').value,
        retAge: document.getElementById('input-ret-age').value,
        ssAmount: document.getElementById('input-ss-amount').value,
        drawEarly: document.getElementById('input-draw-early').value,
        drawLate: document.getElementById('input-draw-late').value,
        investments: Array.from(document.querySelectorAll('#investment-rows tr')).map(r => ({
            name: r.cells[0]?.querySelector('input')?.value || '',
            class: r.cells[1]?.querySelector('select')?.value || '',
            balance: r.cells[2]?.querySelector('input[type=number]')?.value || 0
        })),
        realEstate: Array.from(document.querySelectorAll('#housing-list tr')).map(r => ({
            address: r.cells[0]?.querySelector('input')?.value || '',
            value: r.cells[1]?.querySelector('input')?.value || 0,
            mortgage: r.cells[2]?.querySelector('input')?.value || 0
        })),
        otherAssets: Array.from(document.querySelectorAll('#other-assets-list tr')).map(r => ({
            name: r.cells[0]?.querySelector('input')?.value || '',
            value: r.cells[1]?.querySelector('input')?.value || 0,
            debt: r.cells[2]?.querySelector('input')?.value || 0
        })),
        debts: Array.from(document.querySelectorAll('#debt-rows tr')).map(r => ({
            name: r.cells[0]?.querySelector('input')?.value || '',
            balance: r.cells[1]?.querySelector('input')?.value || 0
        })),
        income: Array.from(document.querySelectorAll('#income-list > div')).map(d => ({
            name: d.querySelector('input[placeholder="Source Name"]')?.value || '',
            amount: d.querySelectorAll('input[type=number]')[0]?.value || 0,
            bonusPct: d.querySelectorAll('input[type=number]')[1]?.value || 0,
            increase: d.querySelectorAll('input[type=range]')[0]?.value || 0,
            contribution: d.querySelectorAll('input[type=range]')[1]?.value || 0,
            match: d.querySelectorAll('input[type=range]')[2]?.value || 0
        })),
        savings: Array.from(document.querySelectorAll('#savings-rows tr')).map(r => ({
            name: r.cells[0]?.querySelector('input')?.value || '',
            amount: r.cells[2]?.querySelector('input')?.value || 0
        }))
    };
    window.currentData = data;
    engine.updateSummary(data);
    if (window.saveUserData) window.saveUserData(data);
};

window.loadUserDataIntoUI = (data) => {
    if (data) {
        window.currentData = data;
        document.getElementById('user-birth-year').value = data.birthYear || 1986;
        const mapping = [['investment-rows', 'investment', data.investments], ['housing-list', 'housing', data.realEstate], ['other-assets-list', 'other', data.otherAssets], ['debt-rows', 'debt', data.debts], ['income-list', 'income', data.income], ['savings-rows', 'savings-item', data.savings]];
        mapping.forEach(m => {
            const c = document.getElementById(m[0]);
            if (c && m[2]) { c.innerHTML = ''; m[2].forEach(item => window.addRow(m[0], m[1], item)); }
        });
    }
    engine.updateSummary(data || {});
    window.calculateUserAge();
};