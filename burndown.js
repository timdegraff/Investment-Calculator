
import { formatter } from './formatter.js';
import { math } from './utils.js';
import { benefits } from './benefits.js';

export const burndown = {
    init: () => {
        const burndownTab = document.getElementById('tab-burndown');
        burndownTab.innerHTML = `
            <div class="card-container p-5">
                 <h3 class="text-xl font-bold mb-4">Retirement Burndown</h3>
                 <div id="burndown-table-container" class="max-h-[75vh] overflow-auto"></div>
            </div>
        `;
    },

    load: (data) => {
        burndown.priorityOrder = data?.priority || burndown.defaultPriority;
    },

    scrape: () => {
        return { priority: burndown.priorityOrder };
    },

    defaultPriority: ['cash', 'taxable', 'roth-basis', 'metals', 'crypto', 'heloc', '401k-72t', '401k', 'roth-earnings'],
    priorityOrder: [],

    assetMeta: {
        'cash': { label: 'Cash', color: '#f472b6', growthKey: null },
        'taxable': { label: 'Taxable Brokerage', color: '#34d399', growthKey: 'stockGrowth' },
        'roth-basis': { label: 'Roth Basis', color: '#fbbf24', growthKey: null }, // Roth basis is static and does not grow
        'metals': { label: 'Metals', color: '#a78bfa', growthKey: 'metalsGrowth' },
        'crypto': { label: 'Bitcoin', color: '#f97316', growthKey: 'cryptoGrowth' },
        'heloc': { label: 'HELOC', color: '#ef4444', growthKey: null },
        '401k': { label: '401k/IRA', color: '#60a5fa', growthKey: 'stockGrowth' },
        '401k-72t': { label: '401k (72t)', color: '#60a5fa', growthKey: 'stockGrowth' },
        'roth-earnings': { label: 'Roth Earnings', color: '#fbbf24', growthKey: 'stockGrowth' },
    },

    run: () => {
        const data = window.currentData;
        if (!data || !data.assumptions) return;
        const tableContainer = document.getElementById('burndown-table-container');
        tableContainer.innerHTML = burndown.renderTable(data);
        const headerRow = document.getElementById('burndown-header-row');
        if (headerRow) {
            new Sortable(headerRow, {
                animation: 150,
                handle: '.drag-handle',
                onEnd: (evt) => {
                    const newOrder = Array.from(evt.to.children).map(th => th.dataset.assetKey).filter(Boolean);
                    burndown.priorityOrder = newOrder;
                    window.debouncedAutoSave();
                }
            });
        }
    },

    renderTable: (data) => {
        const results = burndown.calculate(data);
        const staticHeaders = `<th class="sticky left-0 bg-slate-700 p-3">Age</th><th class="p-3">Budget</th><th class="p-3">SS</th><th class="p-3">Ret. Inc.</th><th class="p-3">SNAP</th>`;
        const draggableHeaders = burndown.priorityOrder.map(key => `<th class="p-3 cursor-move drag-handle" data-asset-key="${key}" style="color: ${burndown.assetMeta[key].color};">${burndown.assetMeta[key].label}</th>`).join('');
        const summaryHeaders = `<th class="p-3">Total Draw</th><th class="p-3">Assets (ex. RE)</th>`;
        const bodyRows = results.map(row => {
            const draggableCells = burndown.priorityOrder.map(key => {
                const draw = row.draws[key] || 0;
                const balance = row.balances[key] || 0;
                const style = draw > 0 ? `color: ${burndown.assetMeta[key].color}; font-weight: 700;` : '';
                return `<td class="p-2 text-right"><span style="${style}">${formatter.formatCurrency(draw, 0)}</span><br/><small class="text-slate-500">${formatter.formatCurrency(balance, 0)}</small></td>`;
            }).join('');
            return `
                <tr class="border-b border-slate-800 align-top">
                    <td class="sticky left-0 bg-slate-900 p-2 text-center font-bold">${row.age}</td>
                    <td class="p-2 text-right">${formatter.formatCurrency(row.budget, 0)}</td>
                    <td class="p-2 text-right">${formatter.formatCurrency(row.ss, 0)}</td>
                    <td class="p-2 text-right">${formatter.formatCurrency(row.retIncome, 0)}</td>
                    <td class="p-2 text-right">${formatter.formatCurrency(row.snap, 0)}</td>
                    ${draggableCells}
                    <td class="p-2 text-right font-bold">${formatter.formatCurrency(row.totalDraw, 0)}</td>
                    <td class="p-2 text-right text-teal-400 font-bold">${formatter.formatCurrency(row.totalAssets, 0)}</td>
                </tr>
            `;
        }).join('');
        return `
            <table class="w-full text-sm text-left">
                <thead class="sticky top-0 bg-slate-700 uppercase text-xs text-slate-300">
                    <tr id="burndown-header-row">${staticHeaders}${draggableHeaders}${summaryHeaders}</tr>
                </thead>
                <tbody>${bodyRows}</tbody>
            </table>
        `;
    },

    calculate: (data) => {
        const { assumptions, investments = [], income = [], budget = {}, helocs = [], benefits: benefitsData } = data;
        const inflationRate = (assumptions.inflation || 3) / 100;

        let balances = {
            'cash': investments.filter(i => i.type === 'Cash').reduce((sum, i) => sum + i.value, 0),
            'taxable': investments.filter(i => i.type === 'Taxable').reduce((sum, i) => sum + i.value, 0),
            'roth-basis': investments.filter(i => i.type === 'Post-Tax (Roth)').reduce((sum, i) => sum + (i.costBasis || 0), 0),
            'roth-earnings': investments.filter(i => i.type === 'Post-Tax (Roth)').reduce((sum, i) => sum + Math.max(0, i.value - (i.costBasis || 0)), 0),
            'metals': investments.filter(i => i.type === 'Metals').reduce((sum, i) => sum + i.value, 0),
            'crypto': investments.filter(i => i.type === 'Crypto').reduce((sum, i) => sum + i.value, 0),
            '401k': investments.filter(i => i.type === 'Pre-Tax (401k/IRA)').reduce((sum, i) => sum + i.value, 0),
            'heloc': helocs.reduce((sum, h) => sum + ((h.limit || 0) - (h.balance || 0)), 0),
        };
        balances['401k-72t'] = balances['401k'];

        const preRetirementIncomeSources = income.filter(i => !i.remainsInRetirement);
        const postRetirementIncomeSources = income.filter(i => i.remainsInRetirement);
        
        let currentBudget = (budget.expenses || []).reduce((sum, item) => sum + (item.annual || (item.monthly * 12)), 0);
        let ssBenefit = (assumptions.ssMonthly || 0) * 12;
        const results = [];

        for (let age = assumptions.currentAge; age <= assumptions.retirementAge + 35; age++) {
            const yearResult = { age, draws: {}, balances: {}, totalDraw: 0 };
            const isRetired = age >= assumptions.retirementAge;

            if (age > assumptions.currentAge) {
                currentBudget *= (1 + inflationRate);
                if (age > assumptions.ssStartAge) ssBenefit *= (1 + inflationRate);

                for (const key in balances) {
                    const meta = burndown.assetMeta[key];
                    if (meta && meta.growthKey) {
                        const growthRate = (assumptions[meta.growthKey] || 0) / 100;
                        balances[key] *= (1 + growthRate);
                    }
                }
                balances['401k-72t'] = balances['401k'];
            }
            yearResult.budget = currentBudget;

            let currentYearTotalIncome = 0;
            const incomeSources = isRetired ? postRetirementIncomeSources : preRetirementIncomeSources;
            incomeSources.forEach(inc => {
                let incomeForYear = inc.annual || (inc.monthly * 12);
                const yearsSinceStart = age - assumptions.currentAge;
                if (!isRetired && yearsSinceStart > 0) {
                   incomeForYear *= Math.pow(1 + ((inc.increase || 0) / 100), yearsSinceStart);
                }
                currentYearTotalIncome += incomeForYear;
            });
            yearResult.retIncome = currentYearTotalIncome;

            const ssIncomeForYear = age >= assumptions.ssStartAge ? ssBenefit : 0;
            yearResult.ss = ssIncomeForYear;

            let shortfall = currentBudget - currentYearTotalIncome - ssIncomeForYear;
            
            const snapIncomeForCalc = currentYearTotalIncome + ssIncomeForYear;
            const snapBenefit = burndown.calculateSnapForYear(snapIncomeForCalc, benefitsData);
            shortfall -= snapBenefit;
            yearResult.snap = snapBenefit;

            shortfall = Math.max(0, shortfall);

            const activePriority = [...burndown.priorityOrder];
            if (age < 60) {
                const idx401k = activePriority.indexOf('401k');
                if (idx401k > -1) activePriority.splice(idx401k, 1);
                const idxRoth = activePriority.indexOf('roth-earnings');
                if (idxRoth > -1) activePriority.splice(idxRoth, 1);
            } else {
                const idx72t = activePriority.indexOf('401k-72t');
                if (idx72t > -1) activePriority.splice(idx72t, 1);
            }

            for (const key of activePriority) {
                if (shortfall <= 0) break;
                let balanceKey = key.replace('-72t', '');
                const available = balances[balanceKey];
                const draw = Math.min(shortfall, available);
                balances[balanceKey] -= draw;
                yearResult.draws[key] = (yearResult.draws[key] || 0) + draw;
                yearResult.totalDraw += draw;
                shortfall -= draw;
            }

            yearResult.balances = { ...balances };
            yearResult.totalAssets = Object.values(balances).reduce((s, v) => s + v, 0) - (balances.heloc || 0); // Exclude HELOC from total assets
            results.push(yearResult);
        }
        return results;
    },

    calculateSnapForYear: (annualIncome, benefitsData) => {
        if (!benefitsData) return 0;
        const { hhSize = 1, snapDeductions = 0, snapDisability = false } = benefitsData;
        const monthlyIncome = annualIncome / 12;
        const fpl = benefits.getFPL(hhSize);
        const grossIncomeLimit = (fpl * (snapDisability ? 2.0 : 1.3)) / 12;
        if (monthlyIncome > grossIncomeLimit) return 0;
        const stdDed = benefits.getStdDeduction(hhSize);
        const earnedIncomeDed = Math.max(0, monthlyIncome * 0.2);
        const adjGross = monthlyIncome - stdDed - earnedIncomeDed;
        const shelterDed = Math.max(0, snapDeductions - (adjGross/2));
        const cappedShelter = snapDisability ? shelterDed : Math.min(shelterDed, benefits.getShelterCap());
        const netIncome = Math.max(0, adjGross - cappedShelter);
        const maxBenefit = benefits.getMaxSnap(hhSize);
        const expectedContrib = netIncome * 0.3;
        const benefitCalc = Math.max(0, maxBenefit - expectedContrib);
        const minBenefit = hhSize <= 2 ? 23 : 0;
        return benefitCalc > 0 ? Math.max(minBenefit, Math.round(benefitCalc)) * 12 : 0;
    }
};