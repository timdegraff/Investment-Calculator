/**
 * MATH.JS - Core Calculation Engine
 * Preserves 2026 Sunset Logic, MI Benefits, and Adds Asset-Class Growth
 */

const engine = {
    // 0. High-Precision Formatting
    formatCompact: (val) => {
        if (val === undefined || isNaN(val)) return "$0";
        const abs = Math.round(Math.abs(val));
        const sign = val < 0 ? "-" : "";
        if (abs >= 1000000) return sign + "$" + (abs / 1000000).toFixed(2) + "M";
        if (abs >= 1000) return sign + "$" + (abs / 1000).toFixed(1) + "K";
        return sign + "$" + abs;
    },

    // 1. New: Growth Rate Mapper (Ensures HSA/Roth/529 grow as stocks)
    getGrowthRate: (assetClass, data) => {
        const stockClasses = [
            "Taxable", 
            "Pre-Tax (401k/IRA)", 
            "Post-Tax (Roth)", 
            "HSA", 
            "529 Plan", 
            "Crypto",
            "Taxable (Brokerage)" // Catch-all for savings table variant
        ];
        
        if (stockClasses.includes(assetClass)) {
            return parseFloat(data.stockGrowth) || 7;
        } else if (assetClass === "Cash/Physical") {
            return 0.5; // Fixed HYSA/Cash estimate
        } else {
            return parseFloat(data.inflation) || 3; // Metals/Default/Physical
        }
    },

    // 2. New: Scraper Tool (Centralized for data.js to use)
    getTableData: (selector, fields) => {
        return Array.from(document.querySelectorAll(selector)).map(tr => {
            const row = {};
            const inputs = tr.querySelectorAll('input, select');
            fields.forEach((field, i) => {
                if (inputs[i]) {
                    row[field] = inputs[i].type === 'number' ? parseFloat(inputs[i].value) || 0 : inputs[i].value;
                }
            });
            return row;
        });
    },

    // 3. Core Net Worth
    calculateNetWorth: (assets, liabilities) => {
        const totalAssets = assets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0);
        const totalDebt = liabilities.reduce((sum, l) => sum + (parseFloat(l.balance) || 0), 0);
        return totalAssets - totalDebt;
    },

    // 4. 2026 Federal Child Tax Credit (CTC)
    calculateCTC: (agi, childrenCount = 4) => {
        const config = TAX_CONSTANTS.CTC;
        const maxPerChild = config.MAX_PER_CHILD || 2200; 
        const threshold = config.PHASE_OUT_START_MFJ;
        let totalCredit = childrenCount * maxPerChild;
        
        if (agi > threshold) {
            const excess = Math.ceil((agi - threshold) / 1000);
            totalCredit = Math.max(0, totalCredit - (excess * 50));
        }
        return totalCredit;
    },

    // 5. Federal Income Tax (MFJ)
    calculateFederalTax: (grossTaxable) => {
        const standardDed = TAX_CONSTANTS.STANDARD_DEDUCTION.MFJ;
        const income = Math.max(0, grossTaxable - standardDed);
        const brackets = TAX_CONSTANTS.BRACKETS.MFJ;
        let tax = 0;

        for (const bracket of brackets) {
            if (income > bracket.min) {
                const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
                tax += taxableInBracket * bracket.rate;
            } else break;
        }
        
        const totalCredit = engine.calculateCTC(grossTaxable, 4);
        return Math.max(0, tax - totalCredit);
    },

    // 6. Michigan Benefit Eligibility Check
    checkMichiganBenefits: (monthlyIncome, familySize = 6) => {
        const snapLimit = MICHIGAN_PROGRAMS.SNAP_MONTHLY_LIMIT[familySize] || 0;
        const medicaidAdultLimit = MICHIGAN_PROGRAMS.MEDICAID_ADULT_MONTHLY[familySize] || 0;
        const medicaidKidsLimit = MICHIGAN_PROGRAMS.MEDICAID_KIDS_MONTHLY[familySize] || 0;

        return {
            snapEligible: monthlyIncome <= snapLimit,
            medicaidAdultsEligible: monthlyIncome <= medicaidAdultLimit,
            medicaidKidsEligible: monthlyIncome <= medicaidKidsLimit
        };
    },

    // 7. SALT vs Standard Deduction
    calculateBestDeduction: (annualIncome, propertyTax) => {
        const miTax = annualIncome * TAX_CONSTANTS.MI_STATE_TAX_RATE;
        const totalSALT = Math.min(miTax + propertyTax, TAX_CONSTANTS.SALT_CAP);
        const standard = TAX_CONSTANTS.STANDARD_DEDUCTION.MFJ;
        
        return {
            amount: Math.max(standard, totalSALT),
            isItemizing: totalSALT > standard
        };
    },

    // 8. 401k Math for GM Scenario
    calculate401kContribution: (base, bonusPct, contribPct, matchPct, includeBonus) => {
        const bonus = base * (bonusPct / 100);
        const totalIncome = base + bonus;
        const effectiveBasis = includeBonus ? totalIncome : base;
        return (effectiveBasis * (contribPct / 100)) + (effectiveBasis * (matchPct / 100));
    },

    // 9. Dynamic Age Update
    updateAgeDisplay: async (saveToCloud = false) => {
        const birthYearInput = document.getElementById('user-birth-year');
        const displayAge = document.getElementById('display-age');
        if (!birthYearInput || !displayAge) return;

        const birthYear = parseInt(birthYearInput.value);
        const targetYear = 2026;

        if (birthYear && birthYear > 1900 && birthYear <= targetYear) {
            displayAge.innerText = `${targetYear - birthYear} YRS OLD (IN 2026)`;
            if (saveToCloud && window.autoSave) window.autoSave();
        } else {
            displayAge.innerText = `-- YRS OLD`;
        }
    },
    runProjection: (data) => {
        if (!data || !data.birthYear) return;

        const startYear = new Date().getFullYear();
        const startAge = startYear - parseInt(data.birthYear);
        const retireAge = parseInt(data.assumptions.retAge) || 65;
        const inflation = (parseFloat(data.assumptions.inflation) || 3) / 100;
        const reAppreciation = (parseFloat(data.assumptions.reAppreciation) || 3) / 100;

        // Deep clone initial financial state to avoid mutation
        let investments = JSON.parse(JSON.stringify(data.investments || []));
        let realEstate = JSON.parse(JSON.stringify(data.realEstate || []));
        let otherAssets = JSON.parse(JSON.stringify(data.otherAssets || []));
        let debts = JSON.parse(JSON.stringify(data.debts || []));
        let savings = data.savingsContributions || [];

        const projection = [];

        for (let age = startAge; age <= retireAge + 20; age++) {
            const currentYear = startYear + (age - startAge);
            
            // A. Add annual savings to the correct investment buckets
            savings.forEach(save => {
                let target = investments.find(inv => inv.class === save.class);
                if (target) {
                    target.value += save.amount;
                } else {
                    // If no matching class exists, create a new investment entry
                    investments.push({ name: `${save.name} (${save.class})`, class: save.class, value: save.amount, basis: save.amount });
                }
            });

            // B. Grow all assets
            investments.forEach(inv => {
                const growthRate = engine.getGrowthRate(inv.class, data.assumptions) / 100;
                inv.value *= (1 + growthRate);
            });
            realEstate.forEach(prop => {
                prop.value *= (1 + reAppreciation);
                // Simple assumption: mortgage debt grows with inflation if not paid down
                if(prop.debt > 0) prop.debt *= (1 + inflation);
            });
             otherAssets.forEach(asset => {
                asset.value *= (1 + inflation); // Assume other assets track inflation
                if(asset.debt > 0) asset.debt *= (1 + inflation);
            });
            debts.forEach(debt => {
                debt.balance *= (1 + inflation); // Assume consumer debt also tracks inflation
            });

            // C. Sum up totals for the year
            const totalPortfolio = investments.reduce((sum, inv) => sum + inv.value, 0);
            const totalRE = realEstate.reduce((sum, prop) => sum + prop.value, 0);
            const totalOther = otherAssets.reduce((sum, asset) => sum + asset.value, 0);
            const totalAssets = totalPortfolio + totalRE + totalOther;

            const reDebt = realEstate.reduce((sum, prop) => sum + prop.debt, 0);
            const otherDebt = otherAssets.reduce((sum, asset) => sum + asset.debt, 0);
            const consumerDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
            const totalDebt = reDebt + otherDebt + consumerDebt;
            
            const netWorth = totalAssets - totalDebt;
            const todaysValue = netWorth / Math.pow(1 + inflation, age - startAge);

            projection.push({
                age: age,
                portfolio: totalPortfolio,
                realEstate: totalRE,
                other: totalOther,
                debt: totalDebt,
                netWorth: netWorth,
                todaysValue: todaysValue
            });
        }
        
        engine.renderProjection(projection, data);
    },
    
    // 11. NEW: Render projection results to UI
    renderProjection: (projection, data) => {
        const tableBody = document.getElementById('projection-table-body');
        const chartCtx = document.getElementById('growthChart')?.getContext('2d');
        if (!tableBody || !chartCtx) return;

        tableBody.innerHTML = '';
        projection.forEach(year => {
            const row = document.createElement('tr');
            row.className = 'border-b border-slate-100 hover:bg-slate-50';
            row.innerHTML = `
                <td class="px-4 py-3 font-bold">${year.age}</td>
                <td class="px-4 py-3 text-right">${Math.round(year.portfolio).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</td>
                <td class="px-4 py-3 text-right">${Math.round(year.realEstate).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</td>
                <td class="px-4 py-3 text-right">${Math.round(year.other).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</td>
                <td class="px-4 py-3 text-right text-red-500">${Math.round(year.debt).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</td>
                <td class="px-4 py-3 text-right font-black">${Math.round(year.netWorth).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</td>
                <td class="px-4 py-3 text-right font-black text-emerald-600">${Math.round(year.todaysValue).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</td>
            `;
            tableBody.appendChild(row);
        });

        // Update Chart
        if (window.growthChart instanceof Chart) {
            window.growthChart.destroy();
        }

        window.growthChart = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: projection.map(p => p.age),
                datasets: [
                    {
                        label: 'Net Worth (Today's $)',
                        data: projection.map(p => p.todaysValue),
                        borderColor: '#10b981', // emerald-600
                        backgroundColor: '#10b98120',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Net Worth (Nominal)',
                        data: projection.map(p => p.netWorth),
                        borderColor: '#4f46e5', // indigo-600
                        backgroundColor: '#4f46e520',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Total Assets',
                        data: projection.map(p => p.portfolio + p.realEstate + p.other),
                        borderColor: '#3b82f6', // blue-500
                        fill: false,
                        hidden: true,
                        tension: 0.4
                    },
                     {
                        label: 'Total Debt',
                        data: projection.map(p => p.debt),
                        borderColor: '#ef4444', // red-500
                        fill: false,
                        hidden: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return (value / 1000000) + 'M';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                         callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                     label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits:0 }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const birthYearInput = document.getElementById('user-birth-year');
    if (birthYearInput) {
        birthYearInput.addEventListener('input', () => engine.updateAgeDisplay(true));
        engine.updateAgeDisplay(); 
    }
});
