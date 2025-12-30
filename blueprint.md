# Project Blueprint

## Overview

This project is a comprehensive Investment and Retirement Calculator designed to help users project their financial future. It allows users to input their assets, debts, income, and expenses, and then projects their net worth over time based on a set of assumptions. The application is built with vanilla JavaScript and Firebase for data persistence.

## Implemented Features

*   **Authentication:** Users can log in with their Google account to save and load their financial data.
*   **Data Input:** Users can input a wide range of financial data, including:
    *   Investments (taxable, pre-tax, post-tax)
    *   Real Estate
    *   Other Assets
    *   Consumer Debts
    *   Income Sources
    *   Monthly Expenses
*   **Assumptions:** Users can configure assumptions for stock growth, real estate appreciation, and inflation.
*   **Projection:** The application projects the user's net worth over time and displays the results in a table and a line chart.
*   **Data Persistence:** All data is automatically saved to Firestore when the user makes changes.

## Current Task: UI/UX Overhaul

The UI/UX of the application has been overhauled with a new design that includes a sidebar for navigation, a dashboard with a summary of the user's financial data, and an asset allocation chart.

### Implemented Changes

*   **Redesigned the main layout:** The application now has a modern and intuitive layout with a sidebar for navigation and a main content area for the different sections of the application.
*   **Improved the visual design:** The color palette, typography, and other visual elements have been updated to create a more professional and polished look.
*   **Enhanced the user experience:** The application is more interactive and user-friendly with a tabbed interface that makes it easy to navigate between the different sections.
*   **Added more visualizations:** An asset allocation chart has been added to the dashboard to give users a visual representation of their investments.
*   **Populated the "Assets" and "Debts" tabs:** These tabs now contain input fields for investments, real estate, other assets, and consumer debt.
*   **Populated the "Income," "Budget," and "Assumptions" tabs:** These tabs now contain input fields for income sources, savings contributions, recurring expenses, and financial assumptions.
*   **Wired up all input fields:** All the input fields are now correctly wired up to the data model, and the data is saved to Firestore when the user makes changes.

### Next Steps: Deployment

*   **Run build command:** Execute `npm run build` to compile frontend assets for deployment.
*   **Deploy to Firebase Hosting:** Deploy the `public` directory to Firebase Hosting.