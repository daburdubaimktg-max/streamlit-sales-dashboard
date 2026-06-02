import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import ChartCard, { COLORS, tooltipStyle } from "./ChartCard.jsx";
import { compact, delta } from "../lib/format.js";

// Year-on-year totals: one small bar chart per metric.
function YoY({ periodTotals }) {
  const metrics = [
    { key: "spend", title: "Spend (AED)" },
    { key: "impressions", title: "Impressions" },
    { key: "videoViews", title: "Views" },
  ];
  return (
    <div className="chart-grid-3">
      {metrics.map((m) => (
        <ChartCard key={m.key} title={`${m.title} — Year on Year`} height={240}>
          <BarChart data={periodTotals}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis dataKey="period" stroke={COLORS.axis} />
            <YAxis stroke={COLORS.axis} tickFormatter={compact} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => compact(v)} />
            <Bar dataKey={m.key} fill={COLORS.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      ))}
    </div>
  );
}

// LY vs TY headline cards for all three metrics.
function LyVsTyCards({ ly, ty, lyLabel, tyLabel }) {
  const metrics = [
    { key: "spend", title: "Spend (AED)" },
    { key: "impressions", title: "Impressions" },
    { key: "videoViews", title: "Views" },
  ];
  return (
    <div className="kpi-row">
      {metrics.map((m) => {
        const tyVal = ty ? ty[m.key] : 0;
        const lyVal = ly ? ly[m.key] : 0;
        const change = lyVal ? ((tyVal - lyVal) / lyVal) * 100 : null;
        const up = change != null && change >= 0;
        return (
          <div className="kpi-card" key={m.key}>
            <div className="kpi-label">{m.title} — {tyLabel} vs {lyLabel}</div>
            <div className="kpi-value">{compact(tyVal)}</div>
            <div className="kpi-sub">
              <span className={"trend-delta " + (up ? "up" : "down")}>
                {up ? "▲" : "▼"} {delta(change)}
              </span>{" "}
              <span className="muted-text">vs {compact(lyVal)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Reusable grouped LY/TY bar chart.
function GroupedCompare({ title, data, xKey, lyLabel, tyLabel, fmt }) {
  return (
    <ChartCard title={title}>
      <BarChart data={data} layout={xKey === "name" ? "vertical" : "horizontal"} margin={{ left: xKey === "name" ? 40 : 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        {xKey === "name" ? (
          <>
            <XAxis type="number" stroke={COLORS.axis} tickFormatter={compact} />
            <YAxis type="category" dataKey="name" stroke={COLORS.axis} width={120} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} stroke={COLORS.axis} />
            <YAxis stroke={COLORS.axis} tickFormatter={compact} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
        <Legend />
        <Bar dataKey="LY" name={lyLabel} fill={COLORS.ly} radius={[3, 3, 0, 0]} />
        <Bar dataKey="TY" name={tyLabel} fill={COLORS.ty} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}

export default function Comparisons({
  periodTotals, ly, ty, lyLabel, tyLabel,
  metric, quarterData, countryData, brandData,
}) {
  const fmt = metric.fmt;
  return (
    <>
      <h2 className="section-title">Year-on-Year Totals</h2>
      <YoY periodTotals={periodTotals} />

      <h2 className="section-title">This Year vs Last Year ({tyLabel} vs {lyLabel})</h2>
      <LyVsTyCards ly={ly} ty={ty} lyLabel={lyLabel} tyLabel={tyLabel} />

      <div className="chart-grid">
        <GroupedCompare
          title={`Quarterwise — ${metric.label} (${tyLabel} vs ${lyLabel})`}
          data={quarterData} xKey="quarter" lyLabel={lyLabel} tyLabel={tyLabel} fmt={fmt}
        />
        <GroupedCompare
          title={`By Country — ${metric.label} (${tyLabel} vs ${lyLabel})`}
          data={countryData} xKey="name" lyLabel={lyLabel} tyLabel={tyLabel} fmt={fmt}
        />
      </div>

      <GroupedCompare
        title={`By Brand — ${metric.label} (${tyLabel} vs ${lyLabel})`}
        data={brandData} xKey="name" lyLabel={lyLabel} tyLabel={tyLabel} fmt={fmt}
      />
    </>
  );
}
