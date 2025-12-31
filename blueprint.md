# FinCalc Blueprint

## 1. Project Overview

FinCalc is a modern, single-page web application designed to be a personal financial co-pilot. It allows users to track their assets, liabilities, income, and savings to get a clear, real-time picture of their financial health. The application's core feature is its ability to project a user's financial future, providing a visual representation of their potential net worth growth over time.

## 2. Implemented Features & Design

This section documents all design, style, and features implemented from the initial version to the current one.

- **UI & Styling:** The app uses a dark theme with vibrant color accents, styled with Tailwind CSS. Navigation icons are colored to match their respective tabs.
- **Data Persistence:** User data is saved automatically to Firestore after changes are made in the UI.
- **Summaries:** Key financial metrics (Net Worth, Total Assets, Liabilities, etc.) are displayed in the sidebar and at the top of relevant tabs.
- **Asset & Liability Tracking:** Users can manage a detailed list of their investments, real estate, HELOCs, and other debts. Investment rows are reorderable.
- **Conditional Inputs:** The "Cost Basis" field for investments is intelligently enabled or disabled based on the investment type.
- **Income Tracking:** Users can log multiple income sources with details like annual increases and bonus percentages.
- **Integrated Budgeting:** The "Budget" tab combines both expenses and savings contributions for a holistic view. It features auto-calculating fields and sortable columns.
- **Asset-Only Projection:** A dedicated tab provides a year-by-year projection of asset growth until age 80, visualized with a stacked area chart and a detailed data table.

---

## 3. Current Plan: Bug Fixes & UI Polish

This section outlines the plan for the current requested change, focusing on fixing a critical calculation bug and implementing several UI/UX improvements.

### 3.1. Goal

To fix the incorrect HELOC net worth calculation, improve the layout and styling of the Real Estate card, enhance the usability of currency input fields, and standardize the color scheme for financial values across the application.

### 3.2. Actionable Steps

1.  **Fix HELOC Calculation:**
    *   **File:** `utils.js`
    *   **Action:** Modify the `calculateSummaries` function to correctly include HELOC balances in the `totalLiabilities` calculation.

2.  **Update Real Estate Card:**
    *   **File:** `index.html`
    *   **Action:** Add a new "Property Name" input field. Rearrange the fields into a three-column grid: Name, Value, Mortgage. Apply the `input-base` class to all inputs to ensure they match the dark theme.

3.  **Enhance Currency Inputs:**
    *   **File:** `core.js`
    *   **Action:** Update the `focus` event listener for currency fields. When a field is focused, if its numeric value is 0, the input's value will be cleared to an empty string for a smoother editing experience.

4.  **Standardize Colors:**
    *   **File:** `index.html`, `templates.js`
    *   **Action:** Conduct a full review of all text color classes for financial figures.  
        *   Standardize all positive values (assets, income, savings) to use a consistent green (`text-teal-400`).
        *   Standardize all negative values (liabilities, expenses) to use a consistent pink (`text-pink-500`).
        *   This includes summary cards, tables, and the sidebar.
