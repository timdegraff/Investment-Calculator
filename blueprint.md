# FinCalc Blueprint

## 1. Project Overview

FinCalc is a modern, single-page web application designed to be a personal financial co-pilot. It allows users to track their assets, liabilities, income, and savings to get a clear, real-time picture of their financial health. The application's core feature is its ability to project a user's financial future, providing a visual representation of their potential net worth growth over time.

## 2. Implemented Features & Design

This section documents all design, style, and features implemented from the initial version to the current one.

### 2.1. Core Architecture (as of v1.3)

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

## 3. Current Plan: Enhanced Summaries, Styling & Projection

This section outlines the plan for the current requested change.

### 3.1. Goal

To enhance the UI with tab-specific summaries and improved styling, and to overhaul the projection feature to be asset-focused.

### 3.2. Actionable Steps

1.  **Add Tab Summaries & Styling:**
    *   **Summaries:** Add summary sections to the "Income," "Savings," and "Budget" tabs in `index.html`.
    *   **Styling:** Update the styling in `index.html` to bold and color the active tab. Incorporate the teal and pink color scheme and icons into the tab content.
    *   **Logic:** Update `data.js` and `utils.js` to calculate and populate the new summary data.

2.  **Overhaul Projection Feature:**
    *   **Asset-Only Projection:** Modify the projection logic in `utils.js` to be based solely on the growth of assets (investments and savings), ignoring liabilities and budget.
    *   **Projection Table:** In `index.html` and `utils.js`, create a new table that displays the year-by-year projected value of each individual asset until the user is 80 years old.
    *   **Stacked Area Chart:** Replace the current line chart with a stacked area chart in `utils.js`. This chart will visually represent the growth of each asset over time, corresponding to the data in the new projection table.
