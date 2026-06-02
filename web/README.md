# Marketing Performance Dashboard — React

An interactive marketing/advertising performance dashboard built with
**React + Vite**. It runs entirely in the browser: you upload the campaign
tracker (Excel/CSV) — or point it at a public URL — and it renders KPIs and
charts. No backend or server-side data store required.

## Features
- 📂 **Upload Excel/CSV** in the browser (parsed with SheetJS) — your data never
  leaves the page.
- 🔗 **Load from a public URL** (e.g. a Google Sheet *published as CSV*) for an
  auto-updating live source.
- 📊 KPIs: total spend (USD), impressions, reach, clicks, average CTR, video views.
- 🔎 Filters: fiscal year, platform, category, region, brand.
- 📈 Charts: spend by platform, spend by category, top 10 brands by spend, and a
  **monthly spend trend** with the latest month's % change.
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

## Deploy
The build is fully static. This repo includes a GitHub Pages workflow
(`.github/workflows/deploy-pages.yml`) that auto-publishes on every push to
`main`. Vercel/Netlify also work (set the root/base directory to `web`).

## Expected data columns
The uploaded file should follow the master tracker layout, with at least:
`Platform, Brand, Spends (USD), Impressions` — plus `Fiscal Year, Year, Month,
Quarter, Category, Region, Market, Reach, Link Clicks / Clicks,
Video Plays / Views, CTR` for the full set of charts and filters.
