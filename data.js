import { templates } from './templates.js';
import { engine } from './engine.js';

window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600'));
    document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
    document.getElementById(`btn-${tabId}`)?.classList.add('active', 'border-indigo-600', 'text-indigo-600');
};

window.addRow = (containerId, type) => {
    const container = document.getElementById(containerId);
    const row = document.createElement(type === 'income' ? 'div' : 'tr');
    if (type !== 'income') row.className = "border-t border-slate-100";
    row.innerHTML = templates[type]();
    container.appendChild(row);
    return row;
};

import { templates } from './templates.js';
import { engine } from './engine.js';

window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600'));
    document.getElementById(`tab-${tabId}`)?.classList.remove('hidden');
    document.getElementById(`btn-${tabId}`)?.classList.add('active', 'border-indigo-600', 'text-indigo-600');
};

window.calculateUserAge = () => {
    const val = document.getElementById('user-birth-year').value;
    document.getElementById('display-age').innerText = new Date().getFullYear() - val;
    window.autoSave();
};

window.toggleCostBasis = (el) => {
    const container = el.closest('tr').querySelector('.cost-basis-container');
    el.value === "Post-Tax (Roth)" ? container.classList.remove('hidden') : container.classList.add('hidden');
};

window.addRow = (containerId, type, data = null) => {
    const container = document.getElementById(containerId);
    const row = document.createElement(type === 'income' ? 'div' : 'tr');
    if (type !== 'income') row.className = "border-t border-slate-100";
    row.innerHTML = templates[type]();
    container.appendChild(row);
    return row;
};

window.autoSave = () => {
    const data = {
        birthYear: document.getElementById('user-birth-year').value,
        investments: Array.from(document.querySelectorAll('#investment-rows tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            class: r.cells[1].querySelector('select').value,
            balance: r.cells[2].querySelector('input[type=number]').value,
            basis: r.querySelector('.cost-basis-container input')?.value
        })),
        realEstate: Array.from(document.querySelectorAll('#housing-list tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            value: r.cells[1].querySelector('input').value,
            mortgage: r.cells[2].querySelector('input').value,
            tax: r.cells[3].querySelector('input').value
        })),
        otherAssets: Array.from(document.querySelectorAll('#other-assets-list tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            value: r.cells[1].querySelector('input').value
        })),
        debts: Array.from(document.querySelectorAll('#debt-rows tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            balance: r.cells[1].querySelector('input').value
        })),
        income: Array.from(document.querySelectorAll('#income-list > div')).map(d => ({
            name: d.querySelector('input[placeholder="Source Name"]').value,
            amount: d.querySelectorAll('input[type=number]')[0].value,
            bonusPct: d.querySelectorAll('input[type=number]')[1].value,
            nonTaxableUntil: d.querySelectorAll('input[type=number]')[2].value,
            increase: d.querySelectorAll('input[type=range]')[0].value,
            contribution: d.querySelectorAll('input[type=range]')[1].value,
            contribIncludeBonus: d.querySelectorAll('input[type=checkbox]')[0].checked,
            match: d.querySelectorAll('input[type=range]')[2].value,
            matchIncludeBonus: d.querySelectorAll('input[type=checkbox]')[1].checked
        })),
        savings: Array.from(document.querySelectorAll('#savings-rows tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            class: r.cells[1].querySelector('select').value,
            amount: r.cells[2].querySelector('input').value
        })),
        budget: Array.from(document.querySelectorAll('#budget-rows tr')).map(r => ({
            name: r.cells[0].querySelector('input').value,
            amount: r.cells[1].querySelector('input').value
        }))
    };
    engine.updateSummary(data);
    if (window.saveUserData) window.saveUserData(data);
};

window.loadUserDataIntoUI = (data) => {
    if (!data) return;
    document.getElementById('user-birth-year').value = data.birthYear || 1990;
    
    const mapping = [
        { id: 'investment-rows', type: 'investment', list: data.investments },
        { id: 'housing-list', type: 'housing', list: data.realEstate },
        { id: 'other-assets-list', type: 'other', list: data.otherAssets },
        { id: 'debt-rows', type: 'debt', list: data.debts },
        { id: 'income-list', type: 'income', list: data.income },
        { id: 'savings-rows', type: 'savings-item', list: data.savings },
        { id: 'budget-rows', type: 'budget-item', list: data.budget }
    ];

    mapping.forEach(m => {
        const container = document.getElementById(m.id);
        container.innerHTML = '';
        m.list?.forEach(item => {
            const row = window.addRow(m.id, m.type);
            if (m.type === 'income') {
                row.querySelector('input[placeholder="Source Name"]').value = item.name;
                const nums = row.querySelectorAll('input[type=number]');
                nums[0].value = item.amount; nums[1].value = item.bonusPct; nums[2].value = item.nonTaxableUntil;
                const ranges = row.querySelectorAll('input[type=range]');
                ranges[0].value = item.increase; ranges[1].value = item.contribution; ranges[2].value = item.match;
                ranges.forEach(r => r.previousElementSibling.lastElementChild.innerText = r.value + '%');
                const checks = row.querySelectorAll('input[type=checkbox]');
                checks[0].checked = item.contribIncludeBonus; checks[1].checked = item.matchIncludeBonus;
            } else {
                const inputs = row.querySelectorAll('input');
                Object.values(item).forEach((val, i) => { if(inputs[i]) inputs[i].value = val; });
                const select = row.querySelector('select');
                if (select && item.class) select.value = item.class;
            }
        });
    });
    engine.updateSummary(data);
};