const formatter = {
    /**
     * Attaches an event listener to a container to format currency inputs dynamically.
     * It listens for 'input' events and formats the value of any input that has
     * the 'data-type="currency"' attribute.
     */
    init: () => {
        const container = document.getElementById('app-container');
        if (container) {
            container.addEventListener('input', formatter.formatCurrencyInput);
        }
    },

    /**
     * The event handler that formats the input value.
     * @param {Event} e - The input event.
     */
    formatCurrencyInput: (e) => {
        const input = e.target;
        if (input.dataset.type === 'currency') {
            // Store cursor position
            const cursorStart = input.selectionStart;
            const cursorEnd = input.selectionEnd;
            const originalLength = input.value.length;

            // Format the value
            const numericValue = formatter.stripCommas(input.value);
            if (isNaN(numericValue) || numericValue === '') {
                input.value = '';
                return;
            }
            const formattedValue = formatter.addCommas(numericValue);
            input.value = formattedValue;

            // Restore cursor position
            const newLength = input.value.length;
            const lengthDiff = newLength - originalLength;
            
            // Adjust cursor position only if it was not at the end of the input
            if (cursorStart !== originalLength || lengthDiff < 0) {
                 input.setSelectionRange(cursorStart + lengthDiff, cursorEnd + lengthDiff);
            }
        }
    },

    /**
     * Adds commas to a number string for thousands separators.
     * @param {string | number} num - The number to format.
     * @returns {string} - The formatted number string with commas.
     */
    addCommas: (num) => {
        if (num === null || num === undefined) return '';
        const parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    },

    /**
     * Removes commas from a formatted number string.
     * @param {string} str - The formatted string.
     * @returns {string} - The number string without commas.
     */
    stripCommas: (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/,/g, '');
    },

    /**
     * Formats a number into a compact, readable currency string (e.g., $1.23M, $215K).
     * @param {number} value - The numeric value to format.
     * @returns {string} - The formatted currency string.
     */
    formatCurrency: (value) => {
        if (typeof value !== 'number') return '$0';

        const absValue = Math.abs(value);
        const sign = value < 0 ? '-' : '';

        if (absValue >= 1_000_000) {
            return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`;
        } else if (absValue >= 1_000) {
            return `${sign}$${(absValue / 1_000).toFixed(0)}K`;
        }

        return `$${formatter.addCommas(value.toFixed(0))}`;
    }
};

document.addEventListener('DOMContentLoaded', formatter.init);
