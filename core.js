window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600'));
    document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
    document.getElementById(`btn-${tabId}`)?.classList.add('active', 'border-indigo-600', 'text-indigo-600');
    if (tabId === 'growth' && window.currentData) engine.runProjection(window.currentData);
};

window.addRow = (containerId, type, data = null) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const row = document.createElement(type === 'income' ? 'div' : 'tr');
    if (type !== 'income') row.className = "border-t border-slate-100";
    row.innerHTML = templates[type]();
    container.appendChild(row);
    if (data) fillRow(row, type, data);
    return row;
};

function fillRow(row, type, data) {
    const inputs = row.querySelectorAll('input, select');
    if (type === 'income') {
        inputs[0].value = data.name; inputs[1].value = data.amount; inputs[2].value = data.bonusPct;
        const ranges = row.querySelectorAll('input[type=range]');
        ranges[0].value = data.increase; ranges[1].value = data.contribution; ranges[2].value = data.match;
        ranges.forEach(r => r.previousElementSibling.lastElementChild.innerText = r.value + '%');
    } else {
        Object.values(data).forEach((val, i) => { if(inputs[i]) inputs[i].value = val; });
    }
}

window.calculateUserAge = () => {
    const val = document.getElementById('user-birth-year').value;
    document.getElementById('display-age').innerText = (new Date().getFullYear() - val) + " YRS OLD";
    window.autoSave();
};

window.exportCSV = () => {
    const rows = Array.from(document.querySelectorAll('#projection-table-body tr'));
    const headers = Array.from(document.querySelectorAll('#projection-header th')).map(th => th.innerText).join(",");
    let csv = "data:text/csv;charset=utf-8," + headers + "\n";
    rows.forEach(tr => { csv += Array.from(tr.cells).map(td => td.innerText.replace(/[\$,]/g, '')).join(",") + "\n"; });
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "wealth_projection.csv";
    link.click();
};