# FinCalc Blueprint

## 1. Project Overview

FinCalc is a modern, single-page web application designed to be a personal financial co-pilot. It allows users to track their assets, liabilities, income, and savings to get a clear, real-time picture of their financial health. The application's core feature is its ability to project a user's financial future, providing a visual representation of their potential net worth growth over time.

## 2. Implemented Features & Design

This section documents all design, style, and features implemented from the initial version to the current one.

- **UI & Styling:** The app uses a dark theme with vibrant color accents, styled with Tailwind CSS. The UI is designed to be intuitive and visually consistent.
- **Data Persistence:** User data is saved automatically to Firestore after changes are made in the UI.
- **Summaries:** Key financial metrics are displayed with updated formatting for large numbers (e.g., "215K", "1.23M").
- **Asset & Liability Tracking:** Users can manage a detailed list of their investments, real estate, HELOCs, and other debts. Investment rows are reorderable.
- **Conditional Inputs:** The "Cost Basis" field is now correctly enabled for both "Taxable" and "Post-Tax (Roth)" investment types, and it defaults to "N/A" when disabled.
- **Multi-Property Support:** The "Assets & Debts" tab allows users to add and manage multiple real estate properties.
- **Income Tracking:** Users can log multiple income sources with details like annual increases and bonus percentages. The UI includes improved slider labels, icons, and layout.
- **Integrated Budgeting:** The "Budget" tab combines both expenses and savings contributions for a holistic view.
- **Advanced Projections:** A dedicated tab provides a year-by-year projection of asset growth, visualized with a stacked bar chart. The chart aggregates data by asset class, and the projection uses granular APY controls for different asset types. The data table includes a "Total" column and color-coded headers.

---

## 3. Current Plan: Refine Cost Basis & Number Formatting

This section outlines the plan for the current requested change, which focuses on refining the user experience for cost basis entry and number display.

### 3.1. Goal

To improve data accuracy and display consistency by enabling the cost basis input for Roth accounts and implementing more readable formatting for large numbers.

### 3.2. Actionable Steps

1.  **Update Cost Basis Logic:**
    *   **File:** `core.js`
    *   **Action:** Modify the event listener attached to the investment type dropdown. The logic will be updated to enable the `costBasis` input field when the selected type is either "Taxable" or "Post-Tax (Roth)". For all other types, the field will be disabled, and its value will be set to "N/A".

2.  **Update Number Formatting:**
    *   **File:** `formatter.js`
    *   **Action:** Revise the `formatCurrency` function to introduce new formatting rules:
        *   Numbers over 1 million will be displayed with two decimal places and an "M" suffix (e.g., 1,234,000 becomes "1.23M").
        *   Numbers over 1 thousand will be displayed with no decimal places and a "K" suffix (e.g., 215,100 becomes "215K").