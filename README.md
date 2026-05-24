# 💼 Wealth Builder — Personal Investment Strategy Tracker

A single-file HTML/JS web app to track your personal investment strategy. No server required — runs entirely in the browser, stores data in `localStorage`.

## 🚀 Host Free on GitHub Pages

1. Create a new GitHub repository (e.g. `wealth-tracker`)
2. Upload `index.html` to the repo root
3. Go to **Settings → Pages → Source → main branch → / (root)**
4. Your app is live at `https://yourusername.github.io/wealth-tracker`

## ✨ Features

| Module | What it does |
|---|---|
| **Dashboard** | Net worth KPIs, portfolio donut chart, cashflow bar, FI countdown, debt progress, action roadmap |
| **Portfolio** | Add/edit/remove holdings (Personal + SMSF), live price entry, DRIP tracking, gain/loss, target vs actual allocation |
| **Cashflow** | Monthly income, all periodic expenses (weekly/fortnightly/quarterly), investment surplus, inflation projection |
| **Debt Tracker** | Debt amortisation chart, payoff timeline, progress bars, monthly interest cost |
| **SMSF** | Balance projection to age 60, salary sacrifice tracker, concessional cap, compliance notes |
| **Projections** | 18-year 3-scenario (5%/8%/11% p.a.) growth chart + table |
| **Settings** | Investor profile, FI age, target allocations, import/export JSON |

## 💾 Data & Privacy

- **All data is stored locally** in your browser's `localStorage` — nothing is sent to any server.
- Use **Export JSON** to back up your data as a file.
- Use **Import JSON** to restore or transfer between devices.

## 📐 Default Strategy (pre-loaded)

Pre-configured for the strategy document:
- Age 42, FI target age 48
- SMSF salary sacrifice A$1,828/mo
- Target allocation: STRC 25% · SATA 15% · US ETFs 20% · Commercial RE 15% · Bitcoin 10% · Gold 10% · Cash 5%
- Debts: Credit Card A$4,195 + Prepayment A$4,855
- 5% p.a. Sydney CPI inflation

## 🛠 Tech Stack

- Plain HTML + CSS + Vanilla JS (no build step)
- [Chart.js 4.4](https://www.chartjs.org/) via CDN
- Google Fonts (DM Serif Display, Manrope, DM Mono)

## 📱 Mobile Friendly

Responsive grid layout — works on phone, tablet, and desktop.
