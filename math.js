const math = {
    toCurrency: (value) => {
        if (isNaN(value)) return "$0";
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD', 
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },

    getSliderValue: (id) => {
        const slider = document.getElementById(id);
        return slider ? parseFloat(slider.value) : 0;
    }
};