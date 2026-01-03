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
    *   Synchronized household size sliders across both calculators.
    *   Color-coded income slider for the health calculator to visually represent FPL tiers.
*   **Projection:**
    *   Net worth projection chart based on user-defined assumptions.
    *   Detailed year-by-year data breakdown.
*   **Burndown:**
    *   A dedicated page for future burndown chart functionality.

## Current Task: Refine UI and UX

I will make several small but impactful changes to the UI to improve usability and visual clarity.

### Plan

1.  **Right-Align Income Headers:** Adjust the CSS for the income cards to right-align the headers for "Base Salary," "Annual Write-offs," and "Bonus," ensuring they align with the input fields below them.
2.  **Enhance Benefits Calculator UI:**
    *   Improve the styling of the active sub-tab (Health Coverage or SNAP) to make it more visually distinct.
    *   Increase the width of the sliders in the Benefits Calculator to make them easier to interact with.
3.  **Synchronize Household Size Sliders:** Link the "Household Size" sliders in the Health and SNAP calculators so that they update in unison.
4.  **Implement Color-Coded Health Income Slider:** Add a dynamic gradient to the background of the annual income slider in the Health Coverage calculator. The colors will represent the different Federal Poverty Level (FPL) tiers, providing immediate visual feedback to the user.
5.  **Update Blueprint:** Document these UI and functionality enhancements in the `blueprint.md` file.
