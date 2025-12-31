/**
 * DATA.JS - Data-related functionalities
 * Handles gathering data from the UI and loading it back in.
 */

import { addRow, updateSummaries } from './core.js';
import { assumptions as engineAssumptions, getNewUserDefaultData } from './engine.js';
import * as formatter from './formatter.js';

export function gatherDataFromUI() {
    const data = { lastUpdated: new Date().toISOString() };

    // 1. Gather Assumptions
    data.assumptions = {};
    for (const key in engineAssumptions) {
        const input = document.getElementById(`input-${key}`);
        if (input) {
            data.assumptions[key] = parseFloat(input.value);
        }
    }

    // 2. Gather Table and Card Data
    data.investments = getTableData('investment-rows', ['name', 'class', 'value']);
    data.realEstate = getTableData('housing-list', ['name', 'value', 'debt']);
    data.otherAssets = getTableData('other-assets-list', ['name', 'value', 'debt']);
    data.debts = getTableData('debt-rows', ['name', 'balance']);
    data.income = getCardData('income-list');
    data.manualSavings = getTableData('savings-list', ['name', 'class', 'monthly', 'annual']);
    data.expenses = getTableData('budget-rows', ['name', 'monthly', 'annual', 'endYear']);

    return data;
}

export function loadUserDataIntoUI(data) {
    if (!data) {
        console.log("No data found, loading defaults for new user.");
        data = getNewUserDefaultData();
    }

    // 1. Load Assumptions
    for (const key in data.assumptions) {
        const input = document.getElementById(`input-${key}`);
        if (input) {
            input.value = data.assumptions[key];
            // Manually trigger input event for sliders to update their display
            input.dispatchEvent(new Event('input')); 
        }
    }

    // 2. Load Tables
    const tables = {
        'investment-rows': { items: data.investments, type: 'investment' },
        'housing-list': { items: data.realEstate, type: 'housing' },
        'other-assets-list': { items: data.otherAssets, type: 'other' },
        'debt-rows': { items: data.debts, type: 'debt' },
        'savings-list': { items: data.manualSavings, type: 'savings-item' },
        'budget-rows': { items: data.expenses, type: 'budget-item' },
        'income-list': { items: data.income, type: 'income' }
    };

    for (const [id, { items, type }] of Object.entries(tables)) {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = ''; // Clear existing rows
            if (items && Array.isArray(items)) {
                items.forEach(item => addRow(id, type, item));
            }
        }
    }

    // 3. Initial full summary calculation and projection run
    updateSummaries(data);
}

function getTableData(containerId, fields) {
    const rows = document.getElementById(containerId)?.querySelectorAll('tr');
    if (!rows) return [];
    return Array.from(rows).map(row => {
        const data = {};
        fields.forEach(field => {
            const input = row.querySelector(`[data-id="${field}"]`);
            if (input) {
                if (input.dataset.type === 'currency') {
                    data[field] = formatter.stripCommas(input.value);
                } else {
                    data[field] = input.type === 'checkbox' ? input.checked : input.value;
                }
            }
        });
        return data;
    });
}

function getCardData(containerId) {
    const cards = document.getElementById(containerId)?.querySelectorAll('.income-card');
    if (!cards) return [];
    return Array.from(cards).map(card => {
        const data = {};
        card.querySelectorAll('input, select').forEach(input => {
            const id = input.dataset.id;
            if (id) {
                if (input.dataset.type === 'currency') {
                    data[id] = formatter.stripCommas(input.value);
                } else {
                    data[id] = input.type === 'checkbox' ? input.checked : input.value;
                }
            }
        });
        return data;
    });
}
