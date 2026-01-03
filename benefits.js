export const benefits = {
    init: () => {
        document.querySelectorAll('.benefit-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.benefit-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.getAttribute('data-benefit-tab');
                document.getElementById('benefit-tab-health').classList.toggle('hidden', target !== 'health');
                document.getElementById('benefit-tab-snap').classList.toggle('hidden', target !== 'snap');
            });
        });

        // --- Health Listeners ---
        document.getElementById('bh-hh-size').addEventListener('input', benefits.calculateHealth);
        document.getElementById('bh-annual-income').addEventListener('input', benefits.calculateHealth);
        document.getElementById('bh-preg-check').addEventListener('change', benefits.calculateHealth);

        // --- SNAP Listeners ---
        document.getElementById('bs-hh-size').addEventListener('input', benefits.calculateSnap);
        document.getElementById('bs-annual-income').addEventListener('input', benefits.calculateSnap);
        document.getElementById('bs-monthly-deductions').addEventListener('input', benefits.calculateSnap);
        document.getElementById('bs-auto-max-deductions').addEventListener('change', benefits.calculateSnap);
        document.getElementById('bs-disability-check').addEventListener('change', benefits.calculateSnap);

        benefits.calculateHealth();
        benefits.calculateSnap();
    },

    getFPL: (size) => 15650 + ((size - 1) * 5500),
    getMaxSnap: (size) => 292 + ((size - 1) * 215),
    getStdDeduction: (size) => {
        if (size <= 3) return 198;
        if (size == 4) return 208;
        if (size == 5) return 244;
        return 279;
    },

    calculateHealth: () => {
        const size = parseInt(document.getElementById('bh-hh-size').value, 10);
        const income = parseInt(document.getElementById('bh-annual-income').value, 10);
        const isPreg = document.getElementById('bh-preg-check').checked;

        document.getElementById('bh-hh-size-val').textContent = size;
        document.getElementById('bh-income-val').textContent = `$${income.toLocaleString()}`;

        const resultBox = document.getElementById('bh-health-result');
        const title = document.getElementById('bh-health-title');
        const desc = document.getElementById('bh-health-desc');

        resultBox.classList.remove('hidden');
        const fpl100 = benefits.getFPL(size);
        const fplPercent = (income / fpl100) * 100;

        const platThreshold = isPreg ? 195 : 138;

        if (fplPercent <= platThreshold) {
            title.textContent = isPreg ? "Healthy Michigan (Pregnancy)" : "Healthy Michigan Plan (Platinum)";
            desc.textContent = isPreg 
                ? "Extended coverage limit (195% FPL). $0 premiums."
                : "State-sponsored. $0 premiums.";
            resultBox.style.borderColor = '#a78bfa'; // violet-400
            title.style.color = '#a78bfa';
        } else if (fplPercent <= 250) {
            title.textContent = "Silver Plus (High Value)";
            desc.textContent = "Eligible for CSR (Lower deductibles).";
            resultBox.style.borderColor = '#60a5fa'; // blue-400
            title.style.color = '#60a5fa';
        } else if (fplPercent <= 400) {
            title.textContent = "Standard Marketplace";
            desc.textContent = "Eligible for Premium Tax Credits.";
            resultBox.style.borderColor = '#fbbf24'; // amber-400
            title.style.color = '#fbbf24';
        } else {
            title.textContent = "Subsidy Cliff";
            desc.textContent = "Full price premiums apply.";
            resultBox.style.borderColor = '#f87171'; // red-400
            title.style.color = '#f87171';
        }
    },

    calculateSnap: () => {
        const size = parseInt(document.getElementById('bs-hh-size').value, 10);
        const income = parseInt(document.getElementById('bs-annual-income').value, 10);
        const deductions = parseInt(document.getElementById('bs-monthly-deductions').value, 10);
        const isAutoMax = document.getElementById('bs-auto-max-deductions').checked;
        const isDisabled = document.getElementById('bs-disability-check').checked;

        document.getElementById('bs-hh-size-val').textContent = size;
        document.getElementById('bs-income-val').textContent = `$${income.toLocaleString()}`;
        document.getElementById('bs-deduct-val').textContent = `$${deductions.toLocaleString()}`;

        const resultBox = document.getElementById('bs-snap-result');
        const title = document.getElementById('bs-snap-title');
        const desc = document.getElementById('bs-snap-desc');
        const mathDiv = document.getElementById('bs-math-content');

        const fpl100_annual = benefits.getFPL(size);
        const limit_annual = fpl100_annual * 2.0;
        const incomeSlider = document.getElementById('bs-annual-income');
        incomeSlider.max = limit_annual;
        document.getElementById('bs-snap-limit-text').textContent = `Max Allowed: $${limit_annual.toLocaleString()}/yr`;

        const currentMonthlyIncome = income / 12;
        let maxDeduction = Math.ceil(currentMonthlyIncome / 100) * 100;
        if (maxDeduction === 0) maxDeduction = 0;

        const deductSlider = document.getElementById('bs-monthly-deductions');
        if (isAutoMax) {
            deductSlider.value = maxDeduction;
            deductSlider.disabled = true;
        } else {
            deductSlider.disabled = false;
            deductSlider.max = maxDeduction;
            if (parseFloat(deductSlider.value) > maxDeduction) {
                deductSlider.value = maxDeduction;
            }
        }

        resultBox.classList.remove('hidden');
        const maxBenefit = benefits.getMaxSnap(size);
        const stdDed = benefits.getStdDeduction(size);
        
        const adjIncome = Math.max(0, currentMonthlyIncome - stdDed);
        const halfAdjIncome = adjIncome * 0.5;
        let excessShelter = Math.max(0, deductions - halfAdjIncome);
        
        const shelterCap = 700; 
        if (!isDisabled && excessShelter > shelterCap) {
            excessShelter = shelterCap;
        }

        const netIncome = Math.max(0, adjIncome - excessShelter);
        const benefitCalc = maxBenefit - (0.3 * netIncome);
        
        let finalBenefit = 0;
        if (benefitCalc > 0) {
            finalBenefit = Math.max(0, Math.round(benefitCalc));
            if (size <= 2 && finalBenefit < 23 && finalBenefit > 0) finalBenefit = 23;
        }

        if (finalBenefit > 0) {
            title.textContent = `$${finalBenefit} / month`;
            desc.textContent = "Estimated SNAP Benefit.";
            title.style.color = "#34d399"; // emerald-400
        } else {
            title.textContent = "$0 Benefit";
            desc.textContent = "Benefit reduces to zero.";
            title.style.color = "#94a3b8"; // slate-400
        }

        mathDiv.innerHTML = `
            <div class="flex justify-between border-b border-slate-700 py-1"><span>Max Grant:</span> <span class="font-mono">$${maxBenefit}</span></div>
            <div class="flex justify-between border-b border-slate-700 py-1"><span>Gross Income:</span> <span class="font-mono">$${Math.round(currentMonthlyIncome)}</span></div>
            <div class="flex justify-between border-b border-slate-700 py-1"><span>- Std Ded:</span> <span class="font-mono">$${stdDed}</span></div>
            <div class="flex justify-between border-b border-slate-700 py-1"><span>- Shelter Ded:</span> <span class="font-mono">$${Math.round(excessShelter)}</span></div>
            <div class="flex justify-between pt-2"><span>= Net Income:</span> <span class="font-mono">$${Math.round(netIncome)}</span></div>
            <div class="text-center text-blue-400 pt-2">Result: $${maxBenefit} - 30% Net</div>
        `;
    }
};