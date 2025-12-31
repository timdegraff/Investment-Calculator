# FinCalc Blueprint

## 1. Project Overview

FinCalc is a modern, single-page web application designed to be a personal financial co-pilot. It allows users to track their assets, liabilities, income, and savings to get a clear, real-time picture of their financial health. The application's core feature is its ability to project a user's financial future, providing a visual representation of their potential net worth growth over time.

## 2. Implemented Features & Design

This section documents all design, style, and features implemented from the initial version to the current one.

### 2.1. Core Architecture (as of v1.2)

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

## 3. Current Plan: UI & UX Enhancements

This section outlines the plan for the current requested change.

### 3.1. Goal

To improve the user experience by implementing several UI and functionality enhancements across the application.

### 3.2. Actionable Steps

1.  **Enhance Monthly Budget:**
    *   **Auto-Calculation:** Implement auto-calculation for the "Monthly" and "Annual" columns in `core.js`.
    *   **Sorting:** Add sorting arrows to the table headers in `index.html` and implement the sorting logic in `core.js`.

2.  **Rename "Bitcoin" to "Crypto":**
    *   Perform a global search and replace in `templates.js` and `utils.js` to change all instances of "Bitcoin" to "Crypto."

3.  **Add "Assets & Debts" Summary:**
    *   Add a summary section at the top of the "Assets & Debts" tab in `index.html`.
    *   Update `data.js` to populate the summary with "Total Assets," "Total Liabilities," and "Total Net Worth."

4.  **Fix Income Tab Issues:**
    *   **Sliders:** Fix the bug with the "Annual Increase" and "401k Contribution" sliders in `core.js`.
    *   **Checkbox:** Add the "remains in retirement?" checkbox to the income card in `templates.js`.
