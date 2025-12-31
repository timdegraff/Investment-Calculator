# Blueprint: Financial Dashboard & Projection Tool

## 1. Purpose & Capabilities

This application is a comprehensive financial dashboard designed to help users track their net worth, manage assets and liabilities, and project their financial future. It provides a single, intuitive interface for logging investments, real estate, debts, and income, and it uses this data to generate sophisticated, long-term financial projections.

---

## 2. Implemented Features & Design

This section documents the project's current state, including all style, design, and features from the initial version to now.

### 2.1. Core Features
- **Authentication:** Secure user login and data management powered by Firebase Authentication.
- **Real-time Database:** All user data is stored and synced in real-time with Firestore, ensuring data persistence across sessions.
- **Modular Architecture:** The application is built with a clean, modular structure (`main.js`, `core.js`, `auth.js`, `data.js`, `utils.js`, `templates.js`, `formatter.js`) for maintainability and scalability.

### 2.2. UI/UX & Design
- **Dark-Themed Interface:** A visually appealing, modern dark theme is used throughout the application.
- **Tabbed Navigation:** The UI is organized into logical tabs ("Assets & Debts", "Budget", "Income", "Projection") for easy access to different financial sections.
- **Dynamic & Responsive:** The application is fully responsive and uses dynamic rows and cards to accommodate a variable number of user inputs.

### 2.3. Feature Details
 - **Summaries:** Key financial metrics are displayed with updated formatting for large numbers (e.g., "215K", "1.23M").
 - **Asset & Liability Tracking:** Users can manage a detailed list of their investments, real estate, HELOCs, and other debts. Investment rows are reorderable.
 - **Conditional Inputs:** The "Cost Basis" field is now correctly enabled for both "Taxable" and "Post-Tax (Roth)" investment types, and it defaults to "N/A" when disabled.
 - **Multi-Property Support:** The "Assets & Debts" tab allows users to add and manage multiple real estate properties.
 - **Income Tracking:** Users can log multiple income sources with details like annual increases and bonus percentages. The UI includes improved slider labels, icons, and layout.
 - **Integrated Budgeting:** The "Budget" tab combines both expenses and savings contributions for a holistic view.
 - **Advanced Projections:** A dedicated tab provides a year-by-year projection of asset growth, visualized with a stacked bar chart. The chart aggregates data by asset class, and the projection uses granular APY controls for different asset types. The data table includes a "Total" column and color-coded headers.
 
---

## 3. Current Plan: Implement Advanced Retirement Projections

This section outlines the plan for the current requested change, which focuses on enhancing the projection model with more detailed retirement and Social Security options.

### 3.1. Goal

To provide users with a more realistic and customizable financial projection by incorporating a retirement age, post-retirement income changes, and Social Security benefits.

### 3.2. Plan

1.  **Add New Assumption Controls:**
    - Create three new sliders in the "Projection" tab's assumption section:
        - **Retirement Age:** To set the year when the user plans to retire.
        - **Social Security Start Age:** To set the age when Social Security benefits begin.
        - **Social Security Monthly Amount:** To set the estimated monthly benefit.
2.  **Update Projection Engine:**
    - **Model Retirement Transition:** Modify the `calculateAssetProjection` function to handle the shift from asset accumulation to decumulation at the specified `retirementAge`.
    - **Filter Income:** Ensure that income sources not marked as "Remains in Retirement" are excluded from calculations after retirement age.
    - **Incorporate Social Security:** Add the Social Security income to the cash flow starting at the `socialSecurityStartAge`.
    - **Simulate Asset "Burn Down":** During retirement, subtract the `totalAnnualBudget` from the assets in a specific order of priority:
        1.  Taxable accounts
        2.  Post-Tax (Roth) accounts
        3.  Pre-Tax (401k/IRA) accounts
3.  **Commit Changes:**
    - Once the features are implemented and tested, commit the changes to the Git repository with a descriptive message.
