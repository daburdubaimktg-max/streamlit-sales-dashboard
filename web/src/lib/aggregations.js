// Pure helpers that turn a list of rows into the numbers the charts need.

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

export function uniqueValues(rows, key) {
  return [...new Set(rows.map((r) => r[key]).filter((v) => v != null))].sort();
}

export function applyFilters(rows, filters) {
  const { cities, customerTypes, genders, dateStart, dateEnd } = filters;
  return rows.filter((r) => {
    if (cities.length && !cities.includes(r.City)) return false;
    if (customerTypes.length && !customerTypes.includes(r.Customer_type)) return false;
    if (genders.length && !genders.includes(r.Gender)) return false;
    if (dateStart && r.dateObj && r.dateObj < dateStart) return false;
    if (dateEnd && r.dateObj && r.dateObj > dateEnd) return false;
    return true;
  });
}

export function kpis(rows) {
  if (!rows.length) {
    return { totalSales: 0, averageRating: 0, averageSale: 0 };
  }
  const totals = rows.map((r) => r.Total);
  const ratings = rows.map((r) => r.Rating).filter((v) => !Number.isNaN(v));
  return {
    totalSales: Math.round(sum(totals)),
    averageRating: ratings.length ? sum(ratings) / ratings.length : 0,
    averageSale: sum(totals) / rows.length,
  };
}

function groupSum(rows, key) {
  const map = new Map();
  for (const r of rows) {
    if (r[key] == null) continue;
    map.set(r[key], (map.get(r[key]) || 0) + r.Total);
  }
  return map;
}

export function salesByProductLine(rows) {
  const map = groupSum(rows, "Product line");
  return [...map.entries()]
    .map(([name, total]) => ({ name, total: Math.round(total) }))
    .sort((a, b) => a.total - b.total);
}

export function salesByHour(rows) {
  const map = groupSum(rows, "hour");
  return [...map.entries()]
    .map(([hour, total]) => ({ hour: Number(hour), total: Math.round(total) }))
    .sort((a, b) => a.hour - b.hour);
}

// Month-over-month totals, sorted chronologically, with % change vs prior month.
export function monthlyTrend(rows) {
  const map = groupSum(rows, "monthKey");
  const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  return sorted.map(([month, total], i) => {
    const prev = i > 0 ? sorted[i - 1][1] : null;
    const change = prev ? ((total - prev) / prev) * 100 : null;
    return { month, total: Math.round(total), change };
  });
}
