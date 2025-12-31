# FinCalc Blueprint

## 1. Project Overview

FinCalc is a modern, single-page web application designed to be a personal financial co-pilot. It allows users to track their assets, liabilities, income, and savings to get a clear, real-time picture of their financial health. The application's core feature is its ability to project a user's financial future, providing a visual representation of their potential net worth growth over time.

## 2. Implemented Features & Design

This section documents all design, style, and features implemented from the initial version to the current one.

### 2.1. Core Architecture (as of v1.1)

-   **Modular JavaScript & Debouncing:** The application uses a modern module-based architecture. All `.js` files are proper ES Modules. A global debounce utility has been implemented to prevent excessive writes to the database during rapid UI interactions.
-   **Centralized Entry Point:** `main.js` serves as the single entry point.
-   **Programmatic Event Handling:** All DOM event listeners are attached programmatically in `core.js`.
-   **State Management:** User data is managed in a `window.currentData` object, which is loaded from Firestore on login and saved back on any change.

### 2.2. User Authentication

-   **Login/Logout:** Users can sign in and out with a Google account via Firebase Authentication.
-   **UI:** A full-screen, modal login page is displayed on startup.

### 2.3. Data Management & Persistence

-   **Database:** User financial data is stored in a Firestore database, keyed by their Firebase UID.
-   **Automatic Saving:** Any change made to the data in the UI triggers a debounced `autoSave` function, which scrapes the entire UI for data and persists it to Firestore.
-   **Default Data:** New users are automatically initialized with a default set of budget items and financial assumptions.

### 2.4. UI & Design

-   **Layout:** A two-column layout featuring a fixed sidebar and a main content area.
-   **Styling:** The UI is styled using Tailwind CSS with a consistent dark theme.
-   **Tabs:** The main content is organized into tabs for Assets & Debts, Income, Savings, Budget, and Projection.

### 2.5. Financial Features

-   **Net Worth Calculation:** The application calculates and displays the user's real-time net worth.
-   **Interactive Projection Chart:** The "Projection" tab features an interactive control panel allowing users to adjust assumptions (e.g., retirement age, growth rate) and instantly see the impact on a 60-year net worth projection chart. The chart visually distinguishes between the pre-retirement accumulation phase and the post-retirement drawdown phase.

---

## 3. Current Plan: Refine Assets & Debts Page

This section outlines the plan for the current requested change.

### 3.1. Goal

To improve the clarity, usability, and accuracy of the "Assets & Debts" tab by refining the Investments table and re-introducing a dedicated Real Estate section.

### 3.2. Actionable Steps

1.  **Refine Investments Table Layout & Logic:**
    *   **Layout:** Modify the table layout in `index.html` and `templates.js` to ensure the "Remove" button is always right-justified.
    *   **Cost Basis Column:** Make the "Cost Basis" column permanently visible for all investment rows.
    *   **Conditional Input:** Update `core.js` to make the "Cost Basis" input field `disabled` for all investment types except for "Post-Tax (Roth)".

2.  **Implement Real Estate Card:**
    *   **HTML Structure:** Add a new "Real Estate" card to the `index.html` file within the "Assets & Debts" tab.
    *   **Input Fields:** The card will contain two primary input fields: "Property Value" and "Mortgage Balance".
    *   **Data Handling:** Update `data.js` to scrape, load, and initialize this new real estate data, storing it as an object (e.g., `{ value: 500000, mortgage: 300000 }`) in the user's data file.

3.  **Integrate Home Equity into Net Worth:**
    *   **Update Calculation Engine:** Modify the `calculateSummaries` function in `utils.js`.
    *   The `totalAssets` calculation will be updated to include the `realEstate.value`.
    *   The `totalLiabilities` calculation will be updated to include the `realEstate.mortgage`.
