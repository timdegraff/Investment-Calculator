# FinCalc - Financial Co-pilot

## Overview

FinCalc is a comprehensive financial dashboard designed to help users track their assets, debts, income, and budget. It provides a clear overview of their financial health and allows them to project their net worth over time based on various assumptions.

## Implemented Features

*   **Authentication:** Secure sign-in with Google.
*   **Data Management:**
    *   CRUD operations for investments, real estate, other assets, HELOCs, and other debts.
    *   Income source tracking.
    *   Budgeting for savings and expenses.
*   **Financial Overview:**
    *   Dashboard with summaries for net worth, assets, and liabilities.
    *   Calculations for total gross income and budget summaries.
*   **Projection:**
    *   Net worth projection chart based on user-defined assumptions.
    *   Detailed year-by-year data breakdown.

## Current Task: Robust Google Login

The goal is to make the Google login process more robust so that it is not affected by any other potential errors in the application.

### Plan

1.  **Isolate Authentication Logic:** Create a dedicated JavaScript file (`auth.js`) that will exclusively handle user authentication with Firebase.
2.  **Prioritize Script Loading:** Modify `index.html` to load the Firebase and authentication scripts before any other application logic. This ensures the login button is always responsive.
3.  **Defer Main Application:** The main application script (`main.js`) will be loaded with the `defer` attribute to ensure it executes after the DOM is fully parsed and doesn't block the rendering of the login screen.
