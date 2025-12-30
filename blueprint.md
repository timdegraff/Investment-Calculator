# Investment Calculator Blueprint

## 1. Overview

A simple web application that calculates investment growth based on user inputs. The application will feature real-time calculations and automatically save the user's data to a Firestore database.

## 2. Features

*   **Input Fields:**
    *   Birth Year
    *   Initial Investment
    *   Monthly Contribution
    *   Retirement Age
    *   Investment Growth Rate
    *   Inflation Rate
*   **Calculations:**
    *   Future value of investments at retirement.
    *   A chart to visualize the growth over time.
*   **Data Persistence:**
    *   User data will be automatically saved to Firestore as it's entered.
    *   Data will be loaded from Firestore when the page loads.

## 3. Design and Styling

*   **Layout:** A clean, modern, single-page layout.
*   **Styling:** We'll use Tailwind CSS for a professional and responsive design.
*   **Charts:** We'll use a JavaScript charting library (like Chart.js) to visualize the investment growth.

## 4. Plan for Current Request: Build the Investment Calculator with Auto-Save

1.  **Create the Blueprint:** Create a `blueprint.md` file to document the project plan.
2.  **Set Up the Route:** Create a new route in `routes/web.php` to handle the calculator page.
3.  **Create the Controller:** Generate a new controller to manage the calculator's logic.
4.  **Create the View:** Create a new Blade view file for the calculator's user interface.
5.  **Build the UI:** Add the HTML for the input fields and the chart display area in the Blade view.
6.  **Add JavaScript for Calculations:** Write the JavaScript code in `resources/js/app.js` to perform the investment calculations.
7.  **Implement Auto-Saving:** Add the necessary JavaScript to automatically save the form data to your Firestore database whenever a user types in an input field.
8.  **Implement Data Loading:** Add JavaScript to load the saved data from Firestore when the page loads.
