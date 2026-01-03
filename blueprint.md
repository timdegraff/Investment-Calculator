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
*   **Benefits Calculator:**
    *   Calculators for Medicaid and SNAP (food stamps) benefits based on household size, income, and other factors.
    *   Real-time calculations and clear result displays.
*   **Projection:**
    *   Net worth projection chart based on user-defined assumptions.
    *   Detailed year-by-year data breakdown.
*   **Burndown:**
    *   A dedicated page for future burndown chart functionality.

## Current Task: Implement Benefits Calculator

I will add a new "Benefits Calculator" tab to the application, providing users with tools to estimate their eligibility for Medicaid and SNAP benefits.

### Plan

1.  **Update `index.html`:**
    *   Add a new "Benefits" button to the sidebar navigation.
    *   Create a new section for the calculator with two sub-tabs: "Health Coverage" (Medicaid) and "SNAP (Food)."
    *   Add the necessary HTML for sliders, input fields, checkboxes, and result displays for both calculators.
2.  **Create `benefits.js`:**
    *   Create a new JavaScript file to house the logic for the benefits calculators.
    *   Implement the calculation logic for both Medicaid and SNAP based on the provided guidelines.
    *   Add event listeners to update the UI in real-time as the user interacts with the controls.
3.  **Update `main.js`:**
    *   Import and initialize the new `benefits.js` module.
4.  **Update `blueprint.md`:**
    *   Document the new "Benefits Calculator" feature.
