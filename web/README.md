# Sales Dashboard — React

An interactive sales dashboard built with **React + Vite**. It runs entirely in
the browser: you upload an Excel/CSV file (or point it at a public URL) and it
renders KPIs and charts — no backend or server-side data store required.

## Features
- 📂 **Upload Excel/CSV** in the browser (parsed with SheetJS) — your data never
  leaves the page.
- 🔗 **Load from a public URL** (e.g. a Google Sheet *published as CSV*) for an
  auto-updating live source.
- 📊 KPIs: total sales, average rating, average sale per transaction.
- 🔎 Filters: city, customer type, gender, and a **date range**.
- 📈 **Month-over-month sales trend** with the latest month's % change.
- 📄 **Download PDF report** of the whole dashboard for management.

## Run locally
```bash
cd web
npm install
npm run dev      # opens http://localhost:5173
```

## Build for production
```bash
npm run build    # outputs static files to web/dist
npm run preview  # preview the production build locally
```

## Deploy (free static hosting → live link)
The build is fully static, so any static host works:

- **Vercel:** import the GitHub repo, set **Root Directory** to `web`. Done.
- **Netlify:** Base directory `web`, build command `npm run build`,
  publish directory `web/dist`.
- **GitHub Pages:** push `web/dist` to a `gh-pages` branch (or use an action).

## Expected data columns
Your file should have these headers (same as the sample dataset):
`City, Customer_type, Gender, Product line, Total, Rating, Date, Time`.
