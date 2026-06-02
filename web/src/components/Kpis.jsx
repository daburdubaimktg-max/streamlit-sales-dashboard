import { aed, compact, pct } from "../lib/format.js";

export default function Kpis({ data }) {
  const cards = [
    { label: "Total Spend (AED)", value: aed(data.spend) },
    { label: "Impressions", value: compact(data.impressions) },
    { label: "Views", value: compact(data.videoViews) },
    { label: "Reach", value: compact(data.reach) },
    { label: "Clicks", value: compact(data.clicks) },
    { label: "Avg CTR", value: pct(data.ctr) },
    { label: "Avg CPM (AED)", value: data.cpm.toFixed(2) },
  ];
  return (
    <div className="kpi-row">
      {cards.map((c) => (
        <div className="kpi-card" key={c.label}>
          <div className="kpi-label">{c.label}</div>
          <div className="kpi-value">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
