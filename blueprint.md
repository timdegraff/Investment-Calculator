# FinCalc Blueprint

## 1. Project Overview

FinCalc is a modern, single-page web application designed to be a personal financial co-pilot. It allows users to track their assets, liabilities, income, and savings to get a clear, real-time picture of their financial health. The application's core feature is its ability to project a user's financial future, providing a visual representation of their potential net worth growth over time.

## 2. Implemented Features & Design

This section documents all design, style, and features implemented from the initial version to the current one.

- **UI & Styling:** The app uses a dark theme with teal and pink accents, styled with Tailwind CSS. The active navigation tab is highlighted.
- **Data Persistence:** User data is saved automatically to Firestore after changes are made in the UI.
- **Summaries:** Key financial metrics (Net Worth, Total Assets, Liabilities, etc.) are displayed in the sidebar and at the top of relevant tabs.
- **Asset & Liability Tracking:** Users can manage a detailed list of their investments, real estate, HELOCs, and other debts.
- **Income Tracking:** Users can log multiple income sources with details like annual increases and bonus percentages.
- **Integrated Budgeting:** The "Budget" tab combines both expenses and savings contributions for a holistic view. It features auto-calculating fields and sortable columns.
- **Asset-Only Projection:** A dedicated tab provides a year-by-year projection of asset growth until age 80, visualized with a stacked area chart and a detailed data table.

---

## 3. Current Plan: UI Enhancements & Reordering

This section outlines the plan for the current requested change.

### 3.1. Goal

To enhance the user interface by adding colored sidebar icons and drag-and-drop reordering for investments. To improve data integrity by making the "Cost Basis" field conditional based on the investment type.

### 3.2. Actionable Steps

1.  **Implement Conditional Cost Basis:**
    *   **File:** `core.js`
    *   **Action:** Add an event listener to the "Type" dropdown in the investment rows. When the type changes, check if it is "Post-Tax (Roth)". If it is, enable the "Cost Basis" input; otherwise, disable it and set its value to "N/A".

2.  **Add Colored Sidebar Icons:**
    *   **File:** `index.html`
    *   **Action:** Add the appropriate Tailwind CSS color classes to the `<i>` elements for each navigation button in the sidebar to match the accent colors used in the main content.

3.  **Implement Reorderable Investments:**
    *   **File:** `index.html`, `templates.js`, `core.js`
    *   **Action:**
        *   Add the CDN for the `SortableJS` library to `index.html`.
        *   Add a drag handle icon to the investment row template in `templates.js`.
        *   In `core.js`, initialize `SortableJS` on the investments table body, configure it to use the new drag handle, and ensure that the `autoSave` function is called after a user finishes reordering the rows to persist the new order.
