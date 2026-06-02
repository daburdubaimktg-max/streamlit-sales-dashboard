// Compact number formatting for big marketing figures (1.95B, 626M, 7.3M...).
export function compact(n) {
  const v = Number(n) || 0;
  const abs = Math.abs(v);
  if (abs >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (abs >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toLocaleString("en-US");
}

export const usd = (n) => "$" + compact(n);
export const usdFull = (n) =>
  "$" + Math.round(Number(n) || 0).toLocaleString("en-US");
export const pct = (n) => (Number(n) * 100).toFixed(2) + "%";
