
# Project Overview

This project is a static HTML/JS Wealth Calculator. It allows users to input their financial data, which is then saved to Firestore. The application calculates and projects wealth growth over time based on user-defined assumptions and investment classes, displaying the results in an interactive chart and a detailed table.

# Implemented Features

*   **Secure Authentication:** Users can sign in with their Google account, ensuring their financial data is private.
*   **Real-time Cloud Sync:** All financial data is automatically saved to Firestore whenever a change is made, providing a seamless, multi-device experience.
*   **Dynamic Financial Dashboard:** A tabbed interface allows users to manage:
    *   **Assets & Debts:** Liquid investments, real estate, other assets, and consumer debts.
    *   **Income & Savings:** Multiple income sources with detailed 401k/contribution settings.
    *   **Budget:** A monthly expense tracker.
    *   **Assumptions:** Configurable growth rates for stocks and real estate, as well as inflation and retirement settings.
*   **Asset-Class-Based Growth:** The calculation engine applies different growth rates based on the asset class selected (e.g., "Taxable", "HSA", "Crypto"), ensuring accurate projections.
*   **Wealth Projection Engine:** A powerful `runProjection` function simulates year-by-year financial growth, accounting for savings, asset growth, and inflation.
*   **Interactive Visualization:**
    *   A line chart displays nominal and inflation-adjusted (Today's $) net worth projections over time.
    *   A detailed data table provides a year-by-year breakdown of the projection.
*   **Data Export:** Users can export their wealth projection data to a CSV file.

# Current Task: Implement Wealth Projection

The final step was to implement the core projection functionality.

# Plan

1.  **Add `runProjection` function to `math.js`:** This function performs the year-by-year simulation of asset growth, savings contributions, and debt changes.
2.  **Add `renderProjection` function to `math.js`:** This function takes the projection data and renders it to both the Chart.js instance and the HTML data table.
3.  **Connect to UI:** Ensure the `runProjection` function is called when the "Growth Projection" tab is activated.
4.  **Update Blueprint:** Document the newly added projection features.
