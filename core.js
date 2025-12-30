/**
 * CORE.JS - UI Management & Utility Functions
 * Handles Tab navigation, Dynamic row creation, and Data Exports.
 */

// 1. Tab Navigation logic
window.showTab = (tabId) => {
    // Hide all contents and reset buttons
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => 
        btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600')
    );
    
    // Show selected tab and highlight button
    document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
    document.getElementById(`btn-${tabId}`)?.classList.add('active', 'border-indigo-600', 'text-indigo-600');
    
    // Auto-refresh projection if moving to growth tab
    if (tabId === 'growth' && window.currentData) {
        engine.runProjection(window.currentData);
    }
};

// 2. Dynamic Row Management
window.addRow = (containerId, type, data = null) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Income uses a div-card layout; everything else uses table rows
    const isIncome = type === 'income';
    const row = document.createElement(isIncome ? 'div' : 'tr');
    
    if (!isIncome) row.className = "border-t border-slate-100";
    
    // Pull the HTML string from templates.js
    row.innerHTML = templates[type]();
    container.appendChild(row);

    // If loading existing data, fill the inputs immediately
    if (data) fillRow(row, type, data);
    
    return row;
};

// Helper to map data objects to DOM inputs
function fillRow(row, type, data) {
    const inputs = row.querySelectorAll('input, select');
    
    if (type === 'income') {
        // Map specific GM-income fields
        inputs[0].value = data.name || '';
        inputs[1].value = data.amount || 0;
        inputs[2].value = data.bonusPct || 0;
        inputs[3].value = data.nonTaxYear || 0;
        
        const ranges = row.querySelectorAll('input[type=range]');
        ranges[0].value = data.increase || 0;
        ranges[1].value = data.contribution || 0;
        ranges[2].value = data.match || 0;
        
        // Update the percentage labels next to sliders
        ranges.forEach(r => {
            if (r.previousElementSibling && r.previousElementSibling.lastElementChild) {
                r.previousElementSibling.lastElementChild.innerText = r.value + '%';
            }
        });

        // Set checkboxes for 401k bonus logic
        const checks = row.querySelectorAll('input[type=checkbox]');
        if (checks[0]) checks[0].checked = data.contribIncBonus;
        if (checks[1]) checks[1].checked = data.matchIncBonus;
        
    } else {
        // Generic mapping for table-based assets/debts
        const values = Object.values(data);
        inputs.forEach((input, i) => {
            if (values[i] !== undefined) {
                if (input.type === 'checkbox') input.checked = values[i];
                else input.value = values[i];
            }
        });
    }
}

// 3. Global Utilities
window.exportCSV = () => {
    const rows = Array.from(document.querySelectorAll('#projection-table-body tr'));
    const headerEl = document.querySelectorAll('#projection-header th');
    const headers = Array.from(headerEl).map(th => th.innerText).join(",");
    
    let csv = "data:text/csv;charset=utf-8," + headers + "\n";
    
    rows.forEach(tr => {
        csv += Array.from(tr.cells)
            .map(td => td.innerText.replace(/[\$,]/g, ''))
            .join(",") + "\n";
    });

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `Wealth_Projection_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};