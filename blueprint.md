# FinCalc - Financial Co-pilot

## Overview

FinCalc is a comprehensive financial dashboard designed to help users track their assets, debts, income, and budget. It provides a clear overview of their financial health and allows them to project their net worth over time based on various assumptions.

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
    *   Calculators for Medicaid and SNAP (food stamps) benefits based on household size, income, and other factors.
    *   Real-time calculations and clear result displays.
    *   Synchronized household size sliders across both calculators.
    *   Color-coded income slider for the health calculator to visually represent FPL tiers.
    *   Default active tab set to "Health Coverage."
    *   Calculator state is saved to Firebase and persists across sessions.
*   **Projection:**
    *   Net worth projection chart based on user-defined assumptions.
    *   Detailed year-by-year data breakdown.
*   **Burndown:**
    *   A dedicated page for future burndown chart functionality.

## Current Task: Enhance Benefits Calculator and Data Persistence

I will improve the Benefits Calculator by setting a default tab and implementing data persistence using Firebase.

### Plan

1.  **Set Default Tab:** Modify the `index.html` file to ensure the "Health Coverage" tab is the active sub-tab by default when the page loads.
2.  **Extend Firebase Data Structure:** Update the `data.js` file to include a new `benefits` section in the Firebase data model. This will store the state of the calculator's controls.
3.  **Implement Data Persistence in `benefits.js`:**
    *   Add a `load` function to populate the calculator with data from Firebase when the application starts.
    *   Add a `scrape` function to gather the current state of the calculator's controls.
    *   Integrate the `autoSave` function to automatically save any changes to Firebase.
4.  **Update Blueprint:** Document the new features and data persistence in the `blueprint.md` file.
