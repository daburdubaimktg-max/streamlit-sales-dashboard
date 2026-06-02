import * as XLSX from "xlsx";

// Columns the dashboard needs to function. Uploaded files should use these
// same header names (matching the sample sales dataset).
export const REQUIRED_COLUMNS = [
  "City",
  "Customer_type",
  "Gender",
  "Product line",
  "Total",
  "Rating",
];

function toDate(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  // Parse "YYYY-MM-DD" without timezone surprises.
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Normalise a raw row: trim keys, coerce numbers, derive hour / month helpers.
export function shapeRow(raw) {
  const o = {};
  for (const k in raw) o[String(k).trim()] = raw[k];

  o.Total = Number(o.Total);
  o.Rating = Number(o.Rating);

  if (o.Time != null) {
    const m = String(o.Time).match(/^(\d{1,2})/);
    o.hour = m ? parseInt(m[1], 10) : null;
  }

  const d = toDate(o.Date);
  if (d) {
    o.dateObj = d;
    o.monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  return o;
}

export function shapeRows(rows) {
  return rows.map(shapeRow).filter((r) => !Number.isNaN(r.Total));
}

function hasRequired(rows) {
  if (!rows.length) return false;
  const keys = Object.keys(rows[0]).map((k) => String(k).trim());
  return REQUIRED_COLUMNS.every((c) => keys.includes(c));
}

// Parse an uploaded Excel/CSV ArrayBuffer into shaped rows. Tries several
// header-row offsets so it works with both the structured sample workbook
// (title rows on top) and plain exports.
export function parseWorkbook(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames.includes("Sales")
    ? "Sales"
    : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  for (let offset = 0; offset <= 6; offset++) {
    const rows = XLSX.utils.sheet_to_json(ws, { range: offset, defval: null });
    const shaped = shapeRows(rows);
    if (hasRequired(shaped)) return shaped;
  }

  throw new Error(
    "Couldn't find the expected columns (" +
      REQUIRED_COLUMNS.join(", ") +
      "). Please check your file's headers."
  );
}
