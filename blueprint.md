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
- **Advanced Projections:** A dedicated tab provides a year-by-year projection of asset growth, visualized with a stacked bar chart. The chart aggregates data by asset class, and the projection uses granular APY controls for different asset types. The data table includes a "Total" column and color-coded headers.

---

## 3. Current Plan: Add Multi-Property Support

This section outlines the plan for the current requested change, which focuses on adding support for multiple real estate properties.

### 3.1. Goal

To enhance the "Assets & Debts" tab by allowing users to add and manage multiple real estate properties, bringing its functionality in line with the "Investments" and "Debts" sections.

### 3.2. Actionable Steps

1.  **Update `index.html`:**
    *   **File:** `index.html`
    *   **Action:** Restructure the "Real Estate" card. Replace the current single-entry form with a table structure. Add a `card-header` containing a title and a `+ Add` button (`<button data-add-row="real-estate-rows" ...>`). The table will have a `<tbody>` with the ID `real-estate-rows` to dynamically hold the property entries.

2.  **Create New Template:**
    *   **File:** `templates.js`
    *   **Action:** Add a new `realEstate` template function. This function will generate the HTML for a table row (`<tr>`) that includes input fields for "Property Name", "Property Value", and "Mortgage Balance", along with a "Remove" button.