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
- **Income Tracking:** Users can log multiple income sources with details like annual increases and bonus percentages.
- **Integrated Budgeting:** The "Budget" tab combines both expenses and savings contributions for a holistic view.
- **Asset-Only Projection:** A dedicated tab provides a year-by-year projection of asset growth until age 80, visualized with a stacked area chart and a detailed data table.

---

## 3. Current Plan: Income UI & Calculation Fixes

This section outlines the plan for the current requested change, focusing on fixing the income calculation, improving the income card UI, and resolving styling inconsistencies.

### 3.1. Goal

To correct the gross income calculation, enhance the UI and layout of the income cards, and fix a styling bug causing white backgrounds on input fields in the budget section.

### 3.2. Actionable Steps

1.  **Correct Income Calculation:**
    *   **File:** `utils.js`
    *   **Action:** Rewrite the `grossIncome` calculation within the `calculateSummaries` function. The new logic will strictly sum the `amount` (base salary) and the calculated `bonus` for each item in the `income` array.

2.  **Fix Input Field Styling:**
    *   **File:** `core.js`
    *   **Action:** In the `addRow` function, restore the correct Tailwind CSS classes (`border-b border-slate-700 hover:bg-slate-700/50`) to the `className` property for newly created table rows (`<tr>`). This will fix the white background issue for inputs in the Budget tab.

3.  **Update Income Card Template:**
    *   **File:** `templates.js`
    *   **Action:** Modify the `income` template string:
        *   Relabel the sliders to "Annual Increase," "Personal 401k %," and "Company 401k %."
        *   Add a `fas fa-money-bill-wave` icon to the top-left corner of the card.
        *   Restructure the HTML to move the "Remains in Retirement?" checkbox directly under the "Annual Increase" slider controls.
