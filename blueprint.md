# Project Blueprint

## Open Tasks
1. add roth cost basis on investment page
2. projections should have each of the asset types like taxable and roth cost basis and roth earnings and metals, crypto etc
3. dont round the budget summary, make it exact dollars (monthly) but round the years as you have it
4. move assumptions to the tab menu, but maybe just a few key ones like retirement age, stock apy, and both draw rates, duplicate them so they are linked with each other so you can edit from either location and it live updates the other.


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

## Learnings & Style Guide

*   **ES Modules:** The `export` keyword can only be used in scripts loaded with `type="module"`. Using `export` in a standard script (`<script src="...">`) will cause a `SyntaxError: Unexpected token 'export'`. For simple global configurations like `firebase-config.js`, it's best to avoid `export` and assign the configuration to a global `const` to prevent this issue.
*   **Git Workflow:** When requested to push files, use the single command: `git add . && git commit -m "pushed updates" && git push`.
