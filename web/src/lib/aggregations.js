// Pure helpers that turn a list of marketing rows into the numbers the
// charts and KPIs need.

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

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
  };
}

function groupSum(rows, key, valueKey = "spend") {
  const map = new Map();
  for (const r of rows) {
    if (r[key] == null) continue;
    map.set(r[key], (map.get(r[key]) || 0) + r[valueKey]);
  }
  return map;
}

// Sorted descending by value; capped to `limit` entries.
function topN(map, limit) {
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export const spendByPlatform = (rows) => topN(groupSum(rows, "platform"), 20);
export const spendByCategory = (rows) => topN(groupSum(rows, "category"), 20);
export const topBrands = (rows) => topN(groupSum(rows, "brand"), 10);

export const impressionsByPlatform = (rows) =>
  topN(groupSum(rows, "platform", "impressions"), 20);

// Monthly spend trend, chronological, with % change vs the previous month.
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
    const [y, m] = monthKey.split("-");
    const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    return { monthKey, label, spend: Math.round(spend), change };
  });
}
