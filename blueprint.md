# FinCalc - Financial Co-pilot

## Overview

FinCalc is a comprehensive financial dashboard designed to help users track their assets, debts, income, and budget. It provides a clear overview of their financial health, allows them to project their net worth over time, and simulate a retirement burndown strategy.

## Implemented Features

*   **Authentication:** Secure sign-in with Google.
*   **Data Management:**
    *   CRUD operations for investments, real estate, other assets, HELOCs, and other debts.
    *   Income source tracking with annual write-offs.
    *   Budgeting for savings and expenses.
    *   All data is saved to Firebase and refreshes on return visits.
*   **Financial Overview:**
    *   Dashboard with summaries for net worth, assets, and liabilities.
    *   Calculations for total gross income and budget summaries.
*   **Benefits Calculator:**
    *   Calculators for Medicaid and SNAP (food stamps) benefits.
    *   Calculator state is saved to Firebase and persists across sessions.
*   **Projection:**
    *   Net worth projection chart based on user-defined assumptions.
*   **Burndown:**
    *   **Retirement Burndown Simulation:** A new tab featuring a detailed year-by-year table simulating the drawdown of assets in retirement.
    *   **Draggable Priority Columns:** Users can drag and drop asset category columns to define their preferred withdrawal order. This priority is saved and reloaded.
    *   **Hard-coded Income:** Social Security and "Retirement Income" are fixed as the first sources of funds.
    *   **SNAP Integration:** A SNAP benefit column is calculated annually based on fixed retirement incomes to supplement the budget.
    *   **Dynamic Calculations:** The table automatically recalculates when the withdrawal priority is changed.
    *   **Asset Categorization:** Aggregates various user-inputted accounts into distinct categories for the burndown (e.g., Cash, Taxable, Roth Basis, Roth Earnings, 401k, etc.).
    *   **Age-Based Rules:** Implements simplified rules for 72(t) distributions from 401ks (pre-60) and tax-free Roth earnings withdrawals (post-60).
    *   **Visual Styling:** Matches the application's aesthetic. Draws from accounts are highlighted in bold and with the asset category's color for clarity.

## Current Task: Implement Retirement Burndown Feature

I will build a retirement burndown simulation in a new, dedicated tab. This feature will allow users to visualize how their assets will be used to cover their budget throughout retirement, based on a customizable withdrawal priority.

### Plan

1.  **Create `burndown.js`:** Isolate all new logic in a dedicated module to prevent disruption of existing code.
2.  **Integrate Module:** Update `main.js` to initialize the new burndown module.
3.  **Enable Data Persistence:** Make minimal and safe additions to `data.js` to save and load the user's custom withdrawal priority order to Firebase.
4.  **Build Burndown Engine & UI:**
    *   Construct the year-by-year calculation engine within `burndown.js`.
    *   Use `Sortable.js` to create a draggable column header interface for setting withdrawal priority.
    *   Implement logic for Social Security, retirement income, and annual SNAP benefit calculations.
    *   Apply styling to match the application's design, including bold, colored text for asset draws.
5.  **Update Blueprint:** Document the new Burndown feature and its implementation in the `blueprint.md` file.
