# FinCalc - Financial Co-pilot

## Overview

FinCalc is a comprehensive financial dashboard designed to help users track their assets, debts, income, and budget. It provides a clear overview of their financial health and allows them to project their net worth over time based on various assumptions.

## Implemented Features

*   **Authentication:** Secure sign-in with Google.
*   **Data Management:**
    *   CRUD operations for investments, real estate, other assets, HELOCs, and other debts.
    *   Income source tracking with annual write-offs.
    *   Budgeting for savings and expenses.
*   **Financial Overview:**
    *   Dashboard with summaries for net worth, assets, and liabilities.
    *   Calculations for total gross income and budget summaries.
*   **Projection:**
    *   Net worth projection chart based on user-defined assumptions.
    *   Detailed year-by-year data breakdown.
*   **Burndown:**
    *   A dedicated page for future burndown chart functionality.

## Current Task: Minor UI and Logic Updates

I will make several minor adjustments to the UI and logic to improve usability and accuracy.

### Plan

1.  **Add "Annual Write-offs" to Income:** Modify the income card template to include a new field for annual write-offs, allowing users to reduce their taxable income.
2.  **Adjust "Cost Basis" Input:** Change the logic to only enable the "Cost Basis" input field when the investment type is "Post-Tax (Roth)."
3.  **Restyle Income Card:** Update the styling of the income card to make the source name larger and apply a green color to the labels for "Base Salary," "Avg Bonus," and "Non-Taxable Until."
4.  **Enforce Retirement Age Logic:** Add logic to the projection controls to ensure the retirement age cannot be set lower than the current age.
5.  **Fix Interest Rate Alignment:** Correct the text justification for the interest rate cells in the "Other Debts" and "HELOCs" tables.
6.  **Update Projection Engine:** Update the projection engine to factor in the new "Annual Write-offs" field when calculating taxable income.
7.  **Update Blueprint:** Document these changes in the `blueprint.md` file.
