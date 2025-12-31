# FinCalc Blueprint

## 1. Project Overview

FinCalc is a modern, single-page web application designed to be a personal financial co-pilot. It allows users to track their assets, liabilities, income, and savings to get a clear, real-time picture of their financial health. The application's core feature is its ability to project a user's financial future, providing a visual representation of their potential net worth growth over time.

The application is built with a modular, front-end architecture using vanilla JavaScript (ESM), styled with Tailwind CSS, and uses Firebase for Google-based authentication and Firestore for data persistence.

## 2. Implemented Features & Design

This section documents all design, style, and features implemented from the initial version to the current one.

### 2.1. Core Architecture (as of v1.0)

-   **Modular JavaScript:** The application was refactored from a global-first approach to a modern module-based architecture. All `.js` files (`main.js`, `core.js`, `auth.js`, `data.js`, `utils.js`, `firebase-config.js`) are now proper ES Modules, using `import` and `export` for clean dependency management.
-   **Centralized Entry Point:** `main.js` serves as the single entry point for the application, orchestrating the initialization of all other modules.
-   **Programmatic Event Handling:** All DOM event listeners are now attached programmatically in `core.js`, removing all `onclick` attributes from the HTML for better maintainability and separation of concerns.
-   **State Management:** User data is managed in a `window.currentData` object, which is loaded from Firestore on login and saved back on any change.

### 2.2. User Authentication

-   **Login:** Users can sign in exclusively via a Google account. The flow is handled by Firebase Authentication.
-   **UI:** A full-screen, modal login page (`login-screen`) is displayed on startup. Upon successful authentication, it is hidden, and the main application (`app-container`) is shown.
-   **Logout:** Users can sign out via a dedicated logout button, which redirects them back to the login screen.

### 2.3. Data Management & Persistence

-   **Database:** User financial data is stored in a Firestore database.
-   **Data Model:** Each user has a single document in a `users` collection, keyed by their Firebase UID. The document contains all their financial information, including investments, debts, income, etc.
-   **Automatic Saving:** Any change made to the data in the UI triggers an `autoSave` function, which scrapes the entire UI for data and persists it to Firestore.
-   **Default Data:** New users are automatically initialized with a default set of budget items to provide a starting point.

### 2.4. UI & Design

-   **Layout:** A two-column layout featuring a fixed sidebar for navigation and a main content area for data interaction.
-   **Styling:** The UI is styled using Tailwind CSS, with a dark theme (bg-slate-800/900). Interactive elements have hover effects and use a consistent color palette (blue for actions, green for positive numbers, red for negative).
-   **Tabs:** The main content is organized into tabs for Assets & Debts, Income, Savings, Budget, Assumptions, and Projection.
-   **Dynamic Rows:** Users can dynamically add and remove items (investments, debts, etc.) via "Add" and "Remove" buttons.

### 2.5. Financial Features

-   **Net Worth Calculation:** The application calculates and displays the user's net worth in the sidebar, derived from the sum of assets minus liabilities.
-   **Financial Summaries:** Key metrics like Total Assets, Total Liabilities, Gross Income, and Total Annual Savings are calculated and displayed.
-   **Projection Chart:** A line chart visualizes the potential growth of the user's net worth over a 50-year horizon, based on current savings and a configurable annual growth rate.

## 3. Current Plan: Interactive Projection Control Panel

This section outlines the plan for the current requested change.

### 3.1. Goal

The goal is to enhance the "Projection" tab by replacing the static "Assumptions" tab with a dynamic and interactive control panel. This will allow users to adjust key financial assumptions in real-time and immediately see the impact on their long-term projection chart.

### 3.2. Actionable Steps

1.  **Consolidate UI:**
    *   Remove the existing "Assumptions" tab from the sidebar navigation (`index.html`).
    *   Remove the corresponding tab content section for "Assumptions" (`index.html`).
    *   Add a new section within the "Projection" tab to serve as the control panel.

2.  **Create Interactive Controls:**
    *   Inside the new control panel section, create a set of labeled input sliders and fields for the following assumptions:
        *   **Retirement Age:** (Slider)
        *   **Investment Growth (APY):** (Slider with percentage)
        *   **Safe Withdrawal Rate (SWR):** (Slider with percentage)
        *   **Effective Tax Rate:** (Slider with percentage)

3.  **Update Event Handling & Logic:**
    *   Modify `core.js` to add event listeners to the new sliders and input fields.
    *   When a control is changed, trigger a function that re-scrapes the assumption values, re-runs the projection calculation (`engine.runProjection`), and updates the chart instantly.

4.  **Enhance the Projection Chart:**
    *   The `engine.calculateProjection` function in `utils.js` will be updated to incorporate the new, dynamic assumption values in its calculations.
    *   The chart will be enhanced to visually indicate the "Retirement Age" on the timeline, perhaps with a vertical line or a change in the line style.
