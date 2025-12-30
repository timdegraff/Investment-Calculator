const assumptions = {
    // Default values for all financial assumptions
    defaults: {
        birthYear: 1990,
        retirementAge: 65,
        // Growth
        stockGrowth: 7,
        housingGrowth: 3,
        // Income
        salaryGrowth: 3,
        // Rates
        inflation: 3,
        preSSDraw: 4,
        postSSDraw: 3.5,
        // Social Security
        ssStartAge: 67,
        ssMonthly: 2000,
    },

    // Definitions for each slider
    sliders: {
        // Personal
        birthYear: { label: "Birth Year", min: 1940, max: new Date().getFullYear(), step: 1, format: (v) => `${v} (Age ${new Date().getFullYear() - v})` },
        retirementAge: { label: "Retirement Age", min: 30, max: 80, step: 1, format: (v) => v },
        // Growth
        stockGrowth: { label: "Stock APY (%)             ", min: 0, max: 15, step: 0.5, format: (v) => `${v}%` },
        housingGrowth: { label: "Housing APY (%)           ", min: 0, max: 10, step: 0.5, format: (v) => `${v}%` },
        salaryGrowth: { label: "Annual Salary Raise (%)   ", min: 0, max: 10, step: 0.1, format: (v) => `${v}%` },
        // Rates
        inflation: { label: "Inflation (%)             ", min: 0, max: 10, step: 0.1, format: (v) => `${v}%` },
        preSSDraw: { label: "Pre-SS Draw Rate (%)      ", min: 0, max: 10, step: 0.1, format: (v) => `${v}%` },
        postSSDraw: { label: "Post-SS Draw Rate (%)     ", min: 0, max: 10, step: 0.1, format: (v) => `${v}%` },
        // Social Security
        ssStartAge: { label: "SS Start Age              ", min: 62, max: 70, step: 1, format: (v) => v },
        ssMonthly: { label: "SS Monthly ($)            ", min: 0, max: 5000, step: 100, format: (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v) },
    },

    /**
     * Initialize the assumptions UI
     * This function creates and adds all the sliders to the DOM.
     */
    init: () => {
        const container = document.getElementById('assumptions-container');
        if (!container) return;

        for (const key in assumptions.sliders) {
            const config = assumptions.sliders[key];
            const sliderHTML = assumptions.createSlider(key, config);
            container.insertAdjacentHTML('beforeend', sliderHTML);
        }
    },

    /**
     * Create HTML for a single slider
     * @param {string} key - The ID for the slider input.
     * @param {object} config - The configuration object for the slider.
     * @returns {string} - The HTML string for the slider.
     */
    createSlider: (key, config) => {
        return `
            <div class="assumption-slider">
                <div class="flex justify-between mb-2">
                    <label class="font-bold text-slate-700">${config.label}</label>
                    <span id="val-${key}" class="font-bold text-indigo-600"></span>
                </div>
                <input id="input-${key}" type="range" min="${config.min}" max="${config.max}" step="${config.step}" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600">
            </div>
        `;
    },

    /**
     * Set up event listeners for all sliders
     * This makes the sliders interactive and updates the display value.
     */
    attachListeners: () => {
        for (const key in assumptions.sliders) {
            const input = document.getElementById(`input-${key}`);
            if (input) {
                input.addEventListener('input', () => assumptions.updateValue(key));
                input.addEventListener('input', window.autoSave); // Also trigger auto-save
            }
        }
    },

    /**
     * Update the display value of a slider
     * @param {string} key - The ID of the slider being updated.
     */
    updateValue: (key) => {
        const input = document.getElementById(`input-${key}`);
        const display = document.getElementById(`val-${key}`);
        const config = assumptions.sliders[key];

        if (input && display && config) {
            display.textContent = config.format(input.value);
        }
    },

    /**
     * Load data into the sliders
     * @param {object} data - The assumptions data to load.
     */
    load: (data) => {
        const a = data || assumptions.defaults;
        for (const key in assumptions.sliders) {
            const input = document.getElementById(`input-${key}`);
            if (input) {
                input.value = a[key] !== undefined ? a[key] : assumptions.defaults[key];
                assumptions.updateValue(key); // Update the display after loading
            }
        }
    }
};

// Initialize and set up listeners on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    assumptions.init();
    assumptions.attachListeners();
});