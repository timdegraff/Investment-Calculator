
import { formatter } from './formatter.js';
import { math } from './utils.js';
import { benefits } from './benefits.js';

export const burndown = {
    init: () => {
        const burndownTab = document.getElementById('tab-burndown');
        burndownTab.innerHTML = `
            <div class="card-container p-5">
                 <div id="burndown-sliders-container" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"></div>
                 <h3 class="text-xl font-bold mb-4">Retirement Burndown</h3>
                 <div id="burndown-table-container" class="max-h-[75vh] overflow-auto"></div>
                 <div id="burndown-debug-container" class="mt-8 p-5 bg-slate-900 rounded-lg"></div>
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
        'roth-basis': { label: 'Roth Basis', color: '#fbbf24', growthKey: 'stockGrowth' }, // Growth applied to combined roth
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
        if (window.createLinkedAgeSliders) {
            window.createLinkedAgeSliders('burndown-sliders-container', data.assumptions);
        }
        const results = burndown.calculate(data);
        document.getElementById('burndown-table-container').innerHTML = burndown.renderTable(results);
        document.getElementById('burndown-debug-container').innerHTML = burndown.renderDebugTable(results);
        const headerRow = document.getElementById('burndown-header-row');
        if (headerRow) {
            new Sortable(headerRow, {
                animation: 150,
                handle: '.drag-handle',
                onEnd: (evt) => {
                    burndown.priorityOrder = Array.from(evt.to.children).map(th => th.dataset.assetKey).filter(Boolean);
                    window.debouncedAutoSave();
                }
            });
        }
    },

    renderTable: (results) => {
        const staticHeaders = `<th class="sticky left-0 bg-slate-700 p-3">Age</th><th class="p-3">Budget</th><th class="p-3">Income</th><th class="p-3">SS</th><th class="p-3 text-red-400">Req. Draw</th><th class="p-3">SNAP</th>`;
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
                    <td class="p-2 text-right">${formatter.formatCurrency(row.income, 0)}</td>
                    <td class="p-2 text-right">${formatter.formatCurrency(row.ss, 0)}</td>
                    <td class="p-2 text-right text-red-400 font-bold">${formatter.formatCurrency(row.requiredDraw, 0)}</td>
                    <td class="p-2 text-right">${formatter.formatCurrency(row.snap, 0)}</td>
                    ${draggableCells}
                    <td class="p-2 text-right font-bold">${formatter.formatCurrency(row.totalDraw, 0)}</td>
                    <td class="p-2 text-right text-teal-400 font-bold">${formatter.formatCurrency(row.totalAssets, 0)}</td>
                </tr>`;
        }).join('');
        return `<table class="w-full text-sm text-left"><thead class="sticky top-0 bg-slate-700 uppercase text-xs text-slate-300"><tr id="burndown-header-row">${staticHeaders}${draggableHeaders}${summaryHeaders}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    },

    renderDebugTable: (results) => {
        let html = `<h4 class="text-lg font-bold mb-2 text-amber-400">Debug Output</h4><table class="w-full text-xs text-left"><thead><tr class="bg-slate-800">`;
        const headers = ['Age', 'Budget', 'Income', 'SS', 'Cashflow', 'Surplus', 'Req. Draw', 'SNAP', 'Shortfall', 'Total Draw', 'Cash'];
        headers.forEach(h => html += `<th class="p-2">${h}</th>`);
        html += `</tr></thead><tbody>`;
        results.forEach(row => {
            html += `<tr class="border-b border-slate-700 font-mono">`;
            html += [row.age, row.debug.budget, row.debug.income, row.debug.ss, row.debug.cashflow, row.debug.surplus, row.debug.requiredDraw, row.debug.snap, row.debug.shortfall, row.totalDraw, row.balances.cash]
                .map((val, i) => `<td class="p-1 ${[2, 4, 5].includes(i) ? 'text-green-400' : [6, 8].includes(i) ? 'text-red-400' : i === 10 ? 'text-pink-400' : ''}">${formatter.formatCurrency(val, 0)}</td>`).join('');
            html += `</tr>`;
        });
        return html + `</tbody></table>`;
    },
    
    calculate: (data) => {
        const { assumptions, investments = [], income = [], budget = {}, helocs = [], benefits: benefitsData } = data;
        const inflationRate = (assumptions.inflation || 3) / 100;

        // Correctly sum all investments by type
        let balances = {
            'cash': investments.filter(i => i.type === 'Cash').reduce((sum, i) => sum + i.value, 0),
            'taxable': investments.filter(i => i.type === 'Taxable').reduce((sum, i) => sum + i.value, 0),
            'roth-basis': investments.filter(i => i.type === 'Post-Tax (Roth)').reduce((sum, i) => sum + (i.costBasis || 0), 0),
            'roth-earnings': investments.filter(i => i.type === 'Post-Tax (Roth)').reduce((sum, i) => sum + Math.max(0, i.value - (i.costBasis || 0)), 0),
            'metals': investments.filter(i => i.type === 'Metals').reduce((sum, i) => sum + i.value, 0),
            'crypto': investments.filter(i => i.type === 'Crypto').reduce((sum, i) => sum + i.value, 0),
            '401k': investments.filter(i => i.type === 'Pre-Tax (401k/IRA)').reduce((sum, i) => sum + i.value, 0),
            'heloc': helocs.reduce((sum, h) => sum + (h.limit || 0) - (h.balance || 0), 0)
        };
        
        let currentBudget = (budget.expenses || []).reduce((sum, item) => sum + (item.annual || (item.monthly * 12)), 0);
        let ssBenefit = (assumptions.ssMonthly || 0) * 12;
        const results = [];

        for (let age = assumptions.currentAge; age <= 100; age++) {
            const isRetired = age >= assumptions.retirementAge;
            const yearResult = { age, draws: {}, totalDraw: 0, debug: {} };

            // --- Apply Growth/Inflation from previous year ---
            if (age > assumptions.currentAge) {
                currentBudget *= (1 + inflationRate);
                if (age >= assumptions.ssStartAge) ssBenefit *= (1 + inflationRate);
                
                // Apply growth to each asset class
                Object.keys(balances).forEach(key => {
                    const meta = burndown.assetMeta[key];
                    if (meta?.growthKey) {
                        const growthRate = (assumptions[meta.growthKey] || 0) / 100;
                        // Special handling for Roth accounts to grow basis and earnings together
                        if (key === 'roth-basis' || key === 'roth-earnings') {
                            const totalRoth = balances['roth-basis'] + balances['roth-earnings'];
                            const grownRoth = totalRoth * (1 + growthRate);
                            const basisRatio = balances['roth-basis'] / totalRoth;
                            balances['roth-basis'] = grownRoth * basisRatio;
                            balances['roth-earnings'] = grownRoth * (1 - basisRatio);
                        } else {
                            balances[key] *= (1 + growthRate);
                        }
                    }
                });
            }
            yearResult.budget = currentBudget;

            // --- Calculate Total Income for the Year ---
            let currentYearTotalIncome = 0;
            const incomeSources = isRetired ? income.filter(i => i.remainsInRetirement) : income;

            incomeSources.forEach(inc => {
                // Correctly determine base annual amount from monthly or annual
                let baseAmount = inc.frequency === 'Annual' ? inc.amount : inc.amount * 12;
                
                // Add bonus if applicable
                if (inc.includeBonus && inc.bonus > 0) {
                    baseAmount += baseAmount * (inc.bonus / 100);
                }

                // Subtract write-offs
                if (inc.writeOffs > 0) {
                    baseAmount -= inc.writeOffs;
                }

                // Apply annual increase for pre-retirement years
                if (!isRetired) {
                    const yearsSinceStart = age - assumptions.currentAge;
                    if (yearsSinceStart > 0 && inc.increase > 0) {
                        baseAmount *= Math.pow(1 + (inc.increase / 100), yearsSinceStart);
                    }
                }
                currentYearTotalIncome += baseAmount;
            });
            yearResult.income = currentYearTotalIncome;

            const ssIncomeForYear = age >= assumptions.ssStartAge ? ssBenefit : 0;
            yearResult.ss = ssIncomeForYear;

            // --- Calculate Cashflow, Surplus, and Required Draw ---
            const cashflow = currentYearTotalIncome + ssIncomeForYear - currentBudget;
            const surplus = Math.max(0, cashflow);
            const requiredDraw = Math.max(0, -cashflow);
            if (surplus > 0) {
                balances.cash += surplus;
            }

            // --- Calculate Benefits and Final Shortfall ---
            const retirementIncomeForSnap = (isRetired ? currentYearTotalIncome : 0) + ssIncomeForYear;
            const snapBenefit = burndown.calculateSnapForYear(retirementIncomeForSnap, benefitsData);
            yearResult.snap = snapBenefit;
            let shortfall = Math.max(0, requiredDraw - snapBenefit);
            
            // Store all debug values
            Object.assign(yearResult, { requiredDraw, debug: { budget: currentBudget, income: currentYearTotalIncome, ss: ssIncomeForYear, cashflow, surplus, requiredDraw, snap: snapBenefit, shortfall } });

            // --- Execute Drawdown Strategy ---
            const disallowedSources = isRetired 
                ? (age < 60 ? ['401k', 'roth-earnings'] : ['401k-72t']) 
                : burndown.priorityOrder.filter(p => !['cash', 'taxable'].includes(p));
            const drawPriority = burndown.priorityOrder.filter(p => !disallowedSources.includes(p));

            for (const key of drawPriority) {
                if (shortfall <= 0) break;
                let balanceKey = key.replace('-72t', '');
                if (!balances[balanceKey] || balances[balanceKey] <= 0) continue;
                
                const draw = Math.min(shortfall, balances[balanceKey]);
                balances[balanceKey] -= draw;
                yearResult.draws[key] = (yearResult.draws[key] || 0) + draw;
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