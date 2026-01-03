
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
        'roth-basis': { label: 'Roth Basis', color: '#fbbf24', growthKey: 'stockGrowth' },
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
                    window.autoSave();
                }
            });
        }
    },

    renderTable: (data) => {
        const results = burndown.calculate(data);

        const staticHeaders = `
            <th class="sticky left-0 bg-slate-700 p-3">Age</th>
            <th class="p-3">Budget</th>
            <th class="p-3">SS</th>
            <th class="p-3">Ret. Inc.</th>
            <th class="p-3">SNAP</th>
        `;

        const draggableHeaders = burndown.priorityOrder.map(key => `
            <th class="p-3 cursor-move drag-handle" data-asset-key="${key}" style="color: ${burndown.assetMeta[key].color};">
                ${burndown.assetMeta[key].label}
            </th>
        `).join('');
        
        const summaryHeaders = `
            <th class="p-3">Total Draw</th>
            <th class="p-3">Assets (ex. RE)</th>
        `;

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
                    <tr id="burndown-header-row">
                        ${staticHeaders}
                        ${draggableHeaders}
                        ${summaryHeaders}
                    </tr>
                </thead>
                <tbody>${bodyRows}</tbody>
            </table>
        `;
    },
    
    calculate: (data) => {
        const assumptions = data.assumptions;
        const investments = data.investments || [];
        const income = data.income || [];
        const budget = data.budget || {};
        const helocs = data.helocs || [];
        const benefitsData = data.benefits;

        const annualSpend = (budget.expenses || []).reduce((sum, item) => sum + (item.annual || (item.monthly * 12)), 0);
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
        
        const retIncomeSources = income.filter(i => i.remainsInRetirement);

        let currentBudget = annualSpend;
        const results = [];

        for (let age = assumptions.currentAge; age <= assumptions.retirementAge + 35; age++) {
            const yearResult = { age, draws: {}, balances: {}, totalDraw: 0 };
            
            if (age > assumptions.currentAge) {
                for (const key in balances) {
                    const meta = burndown.assetMeta[key];
                    if (meta && meta.growthKey) {
                        const growthRate = (assumptions[meta.growthKey] || 0) / 100;
                        balances[key] *= (1 + growthRate);
                    }
                }
            }
            
            let shortfall = 0;
            if (age >= assumptions.retirementAge) {
                if (age > assumptions.retirementAge) {
                     currentBudget *= (1 + inflationRate);
                }
                yearResult.budget = currentBudget;
                shortfall = currentBudget;
            } else {
                 yearResult.budget = 0;
            }

            const ssIncome = age >= assumptions.ssStartAge ? (assumptions.ssMonthly * 12) : 0;
            shortfall -= ssIncome;
            yearResult.ss = ssIncome;

            let retIncome = 0;
            if (age >= assumptions.retirementAge) {
                retIncome = retIncomeSources.reduce((sum, i) => sum + (i.annual || (i.monthly * 12)), 0);
                shortfall -= retIncome;
            }
            yearResult.retIncome = retIncome;

            const snapIncomeForCalc = ssIncome + retIncome;
            const snapBenefit = burndown.calculateSnapForYear(snapIncomeForCalc, benefitsData);
            shortfall -= snapBenefit;
            yearResult.snap = snapBenefit;

            const activePriority = burndown.priorityOrder.slice();

            if (age < 60) {
                const index = activePriority.indexOf('401k');
                if (index > -1) activePriority.splice(index, 1);
                const rothIndex = activePriority.indexOf('roth-earnings');
                if (rothIndex > -1) activePriority.splice(rothIndex, 1);
            }
            
            if (activePriority.includes('401k') && !activePriority.includes('401k-72t')) {
                // no op
            } else if (!activePriority.includes('401k') && activePriority.includes('401k-72t')) {
                const index = activePriority.indexOf('401k-72t');
                activePriority.splice(index, 1, '401k');
            }

            for (const key of activePriority) {
                if (shortfall <= 0) break;
                
                let balanceKey = key.replace('-72t', '');
                const available = balances[balanceKey];
                const draw = Math.min(shortfall, available);
                
                balances[balanceKey] -= draw;
                yearResult.draws[key] = draw;
                yearResult.totalDraw += draw;
                shortfall -= draw;
            }

            yearResult.balances = { ...balances };
            yearResult.totalAssets = Object.values(balances).reduce((s, v) => s + v, 0);
            results.push(yearResult);
        }
        return results;
    },

    calculateSnapForYear: (annualIncome, benefitsData) => {
        if (!benefitsData) return 0;

        const { hhSize = 1, snapDeductions = 0, snapDisability = false } = benefitsData;

        const monthlyIncome = annualIncome / 12;
        const fpl = benefits.getFPL(hhSize);
        const grossIncomeLimit = (fpl * 2.0) / 12;

        if (monthlyIncome > grossIncomeLimit && !snapDisability) {
            return 0;
        }

        const stdDed = benefits.getStdDeduction(hhSize);
        const adjIncome = Math.max(0, monthlyIncome - stdDed);
        const halfAdjIncome = adjIncome * 0.5;
        let excessShelter = Math.max(0, snapDeductions - halfAdjIncome);

        const shelterCap = 700;
        if (!snapDisability && excessShelter > shelterCap) {
            excessShelter = shelterCap;
        }

        const netIncome = Math.max(0, adjIncome - excessShelter);
        const maxBenefit = benefits.getMaxSnap(hhSize);
        const benefitCalc = maxBenefit - (0.3 * netIncome);
        
        let finalBenefit = 0;
        if (benefitCalc > 0) {
            finalBenefit = Math.max(0, Math.round(benefitCalc));
            if (hhSize <= 2 && finalBenefit < 23 && finalBenefit > 0) finalBenefit = 23;
        }

        return finalBenefit * 12;
    }
};