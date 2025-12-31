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
- **Budgeting:** Users can create a detailed monthly and annual budget for their expenses.
- **Asset-Only Projection:** A dedicated tab provides a year-by-year projection of asset growth until age 80, visualized with a stacked area chart and a detailed data table.

---

## 3. Current Plan: Bug Fixes & Savings Refactor

This section outlines the plan for the current requested change.

### 3.1. Goal

To fix several outstanding bugs related to calculations and UI functionality, and to refactor the application by merging the "Savings" functionality into the "Monthly Budget" tab for a more integrated budgeting experience.

### 3.2. Actionable Steps

1.  **Fix HELOC Calculation:**
    *   **File:** `utils.js`
    *   **Action:** Modify the `calculateSummaries` function to correctly include the `helocs` balance in the `totalLiabilities` calculation. This will ensure the sidebar Net Worth is accurate.

2.  **Fix Income Tab Sliders:**
    *   **File:** `core.js` & `templates.js`
    *   **Action:** Diagnose and repair the event listeners for the income card sliders ("Annual Increase," etc.). Ensure the percentage display updates correctly as the slider is moved.

3.  **Implement Budget Tab Features:**
    *   **File:** `core.js` & `index.html`
    *   **Action:** Add the JavaScript logic to auto-calculate the "Annual" budget field when "Monthly" is entered, and vice-versa. Implement the click handlers and sorting logic to allow the budget table to be sorted by the "Monthly" or "Annual" columns.

4.  **Reformat Real Estate Card:**
    *   **File:** `index.html`
    *   **Action:** Restructure the HTML for the "Real Estate" section to match the card-based design from the user-provided screenshot, ensuring consistent styling with the rest of the application.

5.  **Merge Savings into Budget:**
    *   **File:** `index.html`, `core.js`, `data.js`, `utils.js`, `templates.js`
    *   **Action:**
        *   Remove the "Savings" tab from the main navigation and delete its corresponding section in `index.html`.
        *   Add a new "Annual Savings Contributions" table within the "Monthly Budget" tab, positioned above the expenses table.
        *   Create a new template in `templates.js` for the savings rows, containing only "Name" and "Annual Contribution."
        *   Update `data.js` and `utils.js` to scrape data from this new location and include savings contributions in the Budget tab's main summary calculation.
        *   Remove the now-obsolete `savings` summary from `index.html` and `data.js`.
