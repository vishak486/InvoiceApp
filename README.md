# Invoice & Payments App: Frontend

React frontend for the Invoices and Payments app. It talks to the Express/MongoDB backend.

Vercel Deploy Link : https://invoice-app-teal-five.vercel.app/

**Tech:** React (Vite), React Router, Axios, Bootstrap, React-Bootstrap

## Setup

1. Make sure the backend is running (see the backend README).
2. Install packages
   ```
   npm install
   ```
3. Check the backend address in `src/api.js`
   ```js
   baseURL: 'http://localhost:5000'
   ```
   Change the port if your backend runs on a different one.
4. Start the app
   ```
   npm run dev
   ```
   Open the URL shown in the terminal, usually `http://localhost:5173`.

## Folder structure

```
src/
  api.js                  Axios instance with the backend address
  App.jsx                 navbar and routes
  main.jsx                app entry, Bootstrap CSS, router
  pages/
    Customers.jsx         customer list + Add Customer modal
    InvoiceList.jsx       invoice table with status filter
    CreateInvoice.jsx     create invoice with item rows and live totals
    InvoiceDetail.jsx     invoice, items, payment history, Record Payment modal
```

## Screens

| Route | Screen | What it does |
|---|---|---|
| / | Invoice list | Table with invoice number, customer, date, total, paid, balance due and status. Filter by status. Invoice number links to the detail page |
| /create | Create invoice | Choose a customer, add or remove item rows. Line totals and the grand total update as you type |
| /customers | Customers | List of customers and a modal form to add one |
| /invoices/:id | Invoice detail | Invoice, items and payment history. A modal form records a payment, and shows the API's error message if it is rejected |

## Behaviour

- A "Loading..." message shows while data loads.
- Forms are checked before submitting: required fields, valid email, quantity and unit price greater than 0, tax not negative, due date not before invoice date, payment amount greater than 0.
- Totals on the create screen are for display only. The backend recalculates everything.
- After a payment is saved, the invoice reloads so the balance, payments and status badge update.

## Assumptions

- The backend runs on ` https://invoice-payment-backend-gnow.onrender.com`.
- The invoice number is typed by the user.
- Amounts are shown in rupees using Indian number formatting.

## What I would improve with more time

- Outstanding report page: each customer with the total they still owe.
- Search and pagination on the invoice list.
- Edit and delete for customers and invoices.
- Toast messages after saving, and a nicer layout on small screens.
- Move to TypeScript.

