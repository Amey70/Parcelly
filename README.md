# Parcelly

Parcelly is a shipment management dashboard for small businesses. It brings
your carriers, parcels, customers, and delivery analytics into one place —
book shipments, pick a delivery partner, track parcels, and keep customers
informed, all from a single interface.

## Features

- **Dashboard** — overview of shipments, deliveries, exceptions, and spend at a glance.
- **Shipments** — browse, filter, search, and inspect every parcel; create new shipments.
- **Tracking** — paste any tracking number, auto-detect the carrier, and open the official carrier tracking page.
- **Delivery partners** — DHL Express, FedEx, UPS, USPS, Blue Dart, and DTDC, with links to each carrier's booking flow.
- **Customers** — manage customer records and view their shipment history.
- **Analytics** — delivery performance and volume trends over weekly, monthly, or all-time windows.
- **Settings** — workspace profile, default carrier, units, and notification preferences.

All data is stored locally in the browser (localStorage), so the app works
fully offline with seeded demo data. No backend or API keys are required.

## Tech stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- react-router-dom, framer-motion, lucide-react

## Requirements

- Node.js 20+ (developed and tested on Node 22)
- npm

## Getting started

```bash
npm install
npm run dev
```

The dev server starts at http://localhost:5173.

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the Vite dev server          |
| `npm run build`   | Type-check and build for production|
| `npm run preview` | Preview the production build       |
| `npm run lint`    | Run ESLint                         |

## Building for production

```bash
npm run build
```

Output is written to `dist/` and can be served by any static file server.

## Project structure

```
index.html            App entry HTML
src/
  main.tsx            React root
  App.tsx             Shell: navigation, modals, state
  index.css           Global styles (Tailwind)
  lib/
    data.ts           Types, carriers, seeded demo data
    utils.ts          Formatting, storage, carrier detection
  components/         Shared UI (modals, tables, forms)
  pages/              Dashboard, Shipments, Tracking, Partners,
                      Customers, Analytics, Settings
public/               Static assets
```
