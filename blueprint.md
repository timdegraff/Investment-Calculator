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

## 3. Current Plan: UI & Style Refinements

This section outlines the plan for the current requested change, which focuses on fixing visual inconsistencies and bugs in the UI.

### 3.1. Goal

To polish the user interface by fixing the styling of input fields to match the dark theme and correcting a layout bug in the income card's checkbox section.

### 3.2. Actionable Steps

1.  **Correct Income Card Checkbox:**
    *   **File:** `templates.js`
    *   **Action:** Locate the `income` template and find the third checkbox (`<input data-id="matchIncBonus" ...>`). Correct the typo in its `type-` attribute to `type="checkbox"` to fix the layout.

2.  **Fix Input Field Styles:**
    *   **File:** `public/css/style.css`
    *   **Action:** Add a new CSS rule to explicitly set the `background-color` and `color` for the `.input-base` class, which is used for most text inputs and select elements. This will override any default browser styles and ensure all input fields have the correct dark background and light text, resolving the white-background issue.
