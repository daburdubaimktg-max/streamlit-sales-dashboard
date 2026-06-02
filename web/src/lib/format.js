// Compact number formatting for big marketing figures (1.95B, 626M, 7.3M...).
export function compact(n) {
  const v = Number(n) || 0;
  const abs = Math.abs(v);
  if (abs >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (abs >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toLocaleString("en-US");
}

// Currency is AED throughout the dashboard.
export const aed = (n) => "AED " + compact(n);
export const aedFull = (n) =>
  "AED " + Math.round(Number(n) || 0).toLocaleString("en-US");
export const pct = (n) => (Number(n) * 100).toFixed(2) + "%";

// Format a signed percentage change (e.g. +12.3% / -4.1%); null -> "—".
export function delta(change) {
  if (change == null || !isFinite(change)) return "—";
  return (change >= 0 ? "+" : "") + change.toFixed(1) + "%";
}
