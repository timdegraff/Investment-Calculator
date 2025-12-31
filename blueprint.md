# FinCalc Blueprint

## 1. Project Overview

FinCalc is a modern, single-page web application designed to be a personal financial co-pilot. It allows users to track their assets, liabilities, income, and savings to get a clear, real-time picture of their financial health. The application's core feature is its ability to project a user's financial future, providing a visual representation of their potential net worth growth over time.

## 2. Implemented Features & Design

This section documents all design, style, and features implemented from the initial version to the current one.

- **UI & Styling:** The app uses a dark theme with vibrant color accents, styled with Tailwind CSS. The UI is designed to be intuitive and visually consistent.
- **Data Persistence:** User data is saved automatically to Firestore after changes are made in the UI.
- **Summaries:** Key financial metrics (Net Worth, Total Assets, Liabilities, etc.) are displayed in the sidebar and at the top of relevant tabs.
- **Asset & Liability Tracking:** Users can manage a detailed list of their investments, real estate, HELOCs, and other debts. Investment rows are reorderable.
- **Conditional Inputs:** The "Cost Basis" field for investments is intelligently enabled or disabled based on the investment type.
- **Income Tracking:** Users can log multiple income sources with details like annual increases and bonus percentages. The UI includes improved slider labels, icons, and layout.
- **Integrated Budgeting:** The "Budget" tab combines both expenses and savings contributions for a holistic view.
- **Asset-Only Projection:** A dedicated tab provides a year-by-year projection of asset growth until age 80, visualized with a stacked area chart and a detailed data table.

---

## 3. Current Plan: Advanced Projection Features

This section outlines the plan for the current requested change, which focuses on making the financial projection more powerful and insightful.

### 3.1. Goal

To enhance the "Projection" tab by aggregating the chart data by asset class, providing granular growth controls, and improving the data table with a total column and color-coded headers.

### 3.2. Actionable Steps

1.  **Update Projection Controls:**
    *   **Files:** `core.js`, `index.html`
    *   **Action:** In `core.js`, modify the `createAssumptionControls` function to dynamically generate APY sliders for "Stocks," "Metals," and "Crypto." Remove the generic "Avg. Annual Growth" slider. The `index.html` file may not require changes if the container is fully dynamic.

2.  **Aggregate Chart Data & Apply Granular Growth:**
    *   **File:** `utils.js`
    *   **Action:** Overhaul the `calculateAssetProjection` function.
        *   **Aggregation:** Instead of creating a chart dataset for each individual account, create datasets by aggregating accounts based on their `type` (e.g., all "Taxable" accounts are summed into one dataset, all "Roth" into another).
        *   **Granular Growth:** Implement logic to apply the correct new APY assumption (`stockGrowth`, `metalsGrowth`, `cryptoGrowth`) to each asset based on its type during the yearly calculation loop. Cash and Savings will have a 0% growth rate.

3.  **Enhance the Data Table:**
    *   **File:** `utils.js`
    *   **Action:** Update both `calculateAssetProjection` and `runProjection`.
        *   In `calculateAssetProjection`, calculate a `Total` value for all assets for each year and include it in the `tableData`.
        *   In `runProjection`, modify the table rendering logic. The header row will now be: `Year | Age | Total | [Account 1] | [Account 2]...`.
        *   The headers for individual accounts will be dynamically styled with a background color corresponding to their asset `type`, using the `assetClassColors` map. The first three headers ("Year", "Age", "Total") will remain un-styled.
