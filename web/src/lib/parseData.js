import * as XLSX from "xlsx";

// Raw column headers expected in the marketing tracker. Uploaded files should
// use these same names (matching the master tracker layout).
export const REQUIRED_COLUMNS = ["Platform", "Brand", "Spends (AED)", "Impressions"];

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function monthNumber(value) {
  if (!value) return null;
  // Handle combined labels like "April/May" -> take the first month.
  const first = String(value).split("/")[0].trim().toLowerCase();
  return MONTHS[first] || null;
}

const num = (v) => {
  if (v == null || v === "") return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

// Map a raw spreadsheet row to clean internal keys used across the dashboard.
export function shapeRow(raw) {
  const r = {};
  for (const k in raw) r[String(k).trim()] = raw[k];

  const o = {
    fiscalYear: r["Fiscal Year"],
    year: num(r["Year"]),
    month: r["Month"],
    quarter: r["Quarter"],
    campaign: r["Campaign"],
    platform: r["Platform"],
    objective: r["Campaign Objective / KPI"],
    category: r["Category"],
    brand: r["Brand"],
    region: r["Region"],
    market: r["Market"],
    spend: num(r["Spends (AED)"]), // primary currency = AED
    spendUsd: num(r["Spends (USD)"]),
    impressions: num(r["Impressions"]),
    videoViews: num(r["Video Plays / Views"]),
    clicks: num(r["Link Clicks / Clicks"]),
    ctr: num(r["CTR"]),
    reach: num(r["Reach"]),
  };

  const mn = monthNumber(o.month);
  if (o.year && mn) {
    o.monthNum = mn;
    o.monthKey = `${o.year}-${String(mn).padStart(2, "0")}`;
  }
  return o;
}

export function shapeRows(rows) {
  return rows.map(shapeRow).filter((r) => r.platform != null);
}

function hasRequired(rows) {
  if (!rows.length) return false;
  const keys = Object.keys(rows[0]).map((k) => String(k).trim());
  return REQUIRED_COLUMNS.every((c) => keys.includes(c));
}

// Parse an uploaded Excel/CSV ArrayBuffer into shaped rows. Tries several
// header-row offsets so it works even if the sheet has title rows on top.
export function parseWorkbook(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
  // Prefer the "Combined Data" sheet if present, else the first sheet.
  const sheetName =
    wb.SheetNames.find((s) => /combined data/i.test(s)) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  for (let offset = 0; offset <= 6; offset++) {
    const rows = XLSX.utils.sheet_to_json(ws, { range: offset, defval: null });
    if (hasRequired(rows)) return shapeRows(rows);
  }

  throw new Error(
    "Couldn't find the expected columns (" +
      REQUIRED_COLUMNS.join(", ") +
      "). Please check that the file matches the marketing tracker layout."
  );
}
