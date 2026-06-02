// Pure helpers that turn a list of marketing rows into the numbers the
// charts and KPIs need. All sums mirror a pandas groupby().sum().

import { aed, compact } from "./format.js";

// The three metrics the comparison views can switch between.
export const METRICS = {
  spend: { key: "spend", label: "Spend (AED)", fmt: aed, currency: true },
  impressions: { key: "impressions", label: "Impressions", fmt: compact, currency: false },
  videoViews: { key: "videoViews", label: "Views", fmt: compact, currency: false },
};

const round = (n) => Math.round(n);

export function uniqueValues(rows, key) {
  return [...new Set(rows.map((r) => r[key]).filter((v) => v != null))].sort();
}

export function applyFilters(rows, filters) {
  const { fiscalYears, platforms, categories, brands, regions } = filters;
  const ok = (sel, v) => sel.length === 0 || sel.includes(v);
  return rows.filter(
    (r) =>
      ok(fiscalYears, r.fiscalYear) &&
      ok(platforms, r.platform) &&
      ok(categories, r.category) &&
      ok(brands, r.brand) &&
      ok(regions, r.region)
  );
}

// ---- KPIs ----------------------------------------------------------------
const sum = (arr) => arr.reduce((a, b) => a + b, 0);

export function kpis(rows) {
  const spend = sum(rows.map((r) => r.spend));
  const impressions = sum(rows.map((r) => r.impressions));
  const reach = sum(rows.map((r) => r.reach));
  const clicks = sum(rows.map((r) => r.clicks));
  const videoViews = sum(rows.map((r) => r.videoViews));
  return {
    spend,
    impressions,
    reach,
    clicks,
    videoViews,
    ctr: impressions ? clicks / impressions : 0,
    cpm: impressions ? (spend / impressions) * 1000 : 0,
  };
}

// ---- Single-dimension breakdowns (overview charts) -----------------------
function groupSum(rows, key, valueKey = "spend") {
  const map = new Map();
  for (const r of rows) {
    if (r[key] == null) continue;
    map.set(r[key], (map.get(r[key]) || 0) + r[valueKey]);
  }
  return map;
}

function topN(map, limit) {
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export const spendByPlatform = (rows) => topN(groupSum(rows, "platform"), 20);
export const spendByCategory = (rows) => topN(groupSum(rows, "category"), 20);
export const topBrands = (rows) => topN(groupSum(rows, "brand"), 10);
export const spendByRegion = (rows) => topN(groupSum(rows, "region"), 20);
export const spendByMarket = (rows) => topN(groupSum(rows, "market"), 15);

// CTR (%) and CPM (AED) per platform — recomputed from summed totals so the
// rates are accurate (never an average of per-row rates).
export function platformEfficiency(rows) {
  const m = new Map();
  for (const r of rows) {
    if (r.platform == null) continue;
    const o = m.get(r.platform) || { spend: 0, impr: 0, clicks: 0 };
    o.spend += r.spend;
    o.impr += r.impressions;
    o.clicks += r.clicks;
    m.set(r.platform, o);
  }
  return [...m.entries()]
    .map(([name, o]) => ({
      name,
      spend: round(o.spend),
      ctr: o.impr ? (o.clicks / o.impr) * 100 : 0,
      cpm: o.impr ? (o.spend / o.impr) * 1000 : 0,
    }))
    .sort((a, b) => b.spend - a.spend);
}

// ---- Monthly spend trend (AED) -------------------------------------------
export function monthlyTrend(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!r.monthKey) continue;
    map.set(r.monthKey, (map.get(r.monthKey) || 0) + r.spend);
  }
  const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  return sorted.map(([monthKey, spend], i) => {
    const prev = i > 0 ? sorted[i - 1][1] : null;
    const change = prev ? ((spend - prev) / prev) * 100 : null;
    const [y, mo] = monthKey.split("-");
    const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    return { monthKey, label, spend: round(spend), change };
  });
}

// ---- Period helpers (Fiscal Year vs Calendar Year) -----------------------
const pkey = (r, basis) => (basis === "fiscal" ? r.fiscalYear : String(r.year));

export function periods(rows, basis) {
  const key = basis === "fiscal" ? "fiscalYear" : "year";
  return [...new Set(rows.map((r) => r[key]).filter((v) => v != null))]
    .map(String)
    .sort();
}

// Totals per period for all three metrics (Year-on-Year overview).
export function periodTotals(rows, basis) {
  const m = new Map();
  for (const r of rows) {
    const p = pkey(r, basis);
    if (p == null) continue;
    const o = m.get(p) || { spend: 0, impressions: 0, videoViews: 0 };
    o.spend += r.spend;
    o.impressions += r.impressions;
    o.videoViews += r.videoViews;
    m.set(p, o);
  }
  return [...m.entries()]
    .map(([period, o]) => ({
      period,
      spend: round(o.spend),
      impressions: round(o.impressions),
      videoViews: round(o.videoViews),
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

// Quarterwise LY vs TY for one metric.
export function quarterCompare(rows, basis, ly, ty, metricKey) {
  const qs = ["Q1", "Q2", "Q3", "Q4"];
  const m = new Map(qs.map((q) => [q, { LY: 0, TY: 0 }]));
  for (const r of rows) {
    if (!r.quarter || !m.has(r.quarter)) continue;
    const p = pkey(r, basis);
    if (p === ly) m.get(r.quarter).LY += r[metricKey];
    else if (p === ty) m.get(r.quarter).TY += r[metricKey];
  }
  return qs.map((q) => ({ quarter: q, LY: round(m.get(q).LY), TY: round(m.get(q).TY) }));
}

// LY vs TY broken down by a dimension (brand / market), top N by TY value.
export function dimensionCompare(rows, basis, ly, ty, dimKey, metricKey, limit = 12) {
  const m = new Map();
  for (const r of rows) {
    const name = r[dimKey];
    if (name == null) continue;
    const p = pkey(r, basis);
    const o = m.get(name) || { LY: 0, TY: 0 };
    if (p === ly) o.LY += r[metricKey];
    else if (p === ty) o.TY += r[metricKey];
    m.set(name, o);
  }
  return [...m.entries()]
    .map(([name, o]) => {
      const LY = round(o.LY);
      const TY = round(o.TY);
      const change = LY ? ((TY - LY) / LY) * 100 : null;
      return { name, LY, TY, change };
    })
    .filter((d) => d.LY || d.TY)
    .sort((a, b) => b.TY - a.TY)
    .slice(0, limit);
}

// Brand × Country matrix for a single period (heatmap), one metric.
export function brandCountryMatrix(rows, basis, period, metricKey, nBrands = 8, nCountries = 8) {
  const inPeriod = rows.filter((r) => pkey(r, basis) === period);

  const topKeys = (dimKey, n) => {
    const m = new Map();
    for (const r of inPeriod) {
      if (r[dimKey] == null) continue;
      m.set(r[dimKey], (m.get(r[dimKey]) || 0) + r[metricKey]);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map((e) => e[0]);
  };

  const brands = topKeys("brand", nBrands);
  const countries = topKeys("market", nCountries);
  const cell = new Map();
  let max = 0;
  for (const r of inPeriod) {
    if (!brands.includes(r.brand) || !countries.includes(r.market)) continue;
    const k = r.brand + "|" + r.market;
    const v = (cell.get(k) || 0) + r[metricKey];
    cell.set(k, v);
    if (v > max) max = v;
  }
  const matrix = brands.map((b) => ({
    brand: b,
    cells: countries.map((c) => round(cell.get(b + "|" + c) || 0)),
  }));
  return { brands, countries, matrix, max: round(max) };
}
