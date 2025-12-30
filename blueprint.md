# Project Blueprint

## Overview

This project is a comprehensive Investment and Retirement Calculator designed to help users project their financial future. It allows users to input their assets, debts, income, and expenses, and then projects their net worth over time based on a set of assumptions. The application is built with vanilla JavaScript and Firebase for data persistence.

## Implemented Features

*   **Authentication:** Users can log in with their Google account to save and load their financial data.
*   **Data Input:** Users can input a wide range of financial data, including:
    *   Investments (taxable, pre-tax, post-tax)
    *   Real Estate
    *   Other Assets
    *   Consumer Debts
    *   Income Sources
    *   Monthly Expenses
*   **Assumptions:** Users can configure assumptions for stock growth, real estate appreciation, and inflation.
*   **Projection:** The application projects the user's net worth over time and displays the results in a table and a line chart.
*   **Data Persistence:** All data is automatically saved to Firestore when the user makes changes.

## Current Task: UI/UX Overhaul Phase 2 - Refactor & Refinement

The user has requested specific changes to the layout and functionality:

1.  **Sidebar:**
    *   Reorder tabs: Assets & Debts, Income, Savings, Budget, Assumptions, Projection.
    *   Display "Net Worth" permanently under the logo.

2.  **Assets & Debts Tab:**
    *   Combine Assets and Debts into one tab.
    *   Layout: 2 columns on desktop.
    *   Order: Investments -> Real Estate -> Other Assets -> Consumer Debt.
    *   Header: Show Total Assets and Total Liabilities.

3.  **Income Tab:**
    *   Ensure "Non-Taxable Until" field is visible.
    *   Header: Show "2026 Gross Income" summary.

4.  **Savings Tab:**
    *   New tab specifically for savings.
    *   Header: Total Annual Savings.
    *   Section 1: 401k/Match (Read-only view from Income tab).
    *   Section 2: Manual Savings input (HSA, 529, etc.).

5.  **Budget Tab:**
    *   Rename to "Monthly Budget".
    *   Header: Total Budget & Estimated Cashflow (Income - Tax - Expenses).
    *   Prepopulate defaults for new users (Mortgage, Car, Utilities).

6.  **Projection Tab:**
    *   Keep existing functionality.

### Next Steps

*   Update `index.html` to reflect the new tab structure and layout.
*   Update `data.js` to handle prepopulation and saving of the new structure.
*   Update `engine.js` to calculate the new summary metrics (Cashflow, Gross Income).
*   Update `templates.js` if necessary to ensure fields are visible.
