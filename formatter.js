import { math } from './utils.js';

export const formatter = {
    addCommas: (num) => {
        if (num === null || num === undefined) return '';
        const parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    },

    stripCommas: (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/,/g, '');
    },

    formatCurrency: (value, isCompact = false) => {
        if (isNaN(value) || value === null) return '$0';
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            notation: isCompact ? 'compact' : 'standard',
            minimumFractionDigits: 0,
            maximumFractionDigits: isCompact ? 1 : 0
        }).format(value);
    },

    bindCurrencyEventListeners: (input) => {
        if (!input) return;

        input.addEventListener('blur', (e) => {
            const value = math.fromCurrency(e.target.value);
            e.target.value = formatter.formatCurrency(value, false);
        });

        input.addEventListener('focus', (e) => {
            const value = math.fromCurrency(e.target.value);
            if (value === 0) {
                e.target.value = '';
            } else {
                e.target.value = value;
            }
        });
    }
};