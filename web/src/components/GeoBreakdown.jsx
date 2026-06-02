import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import ChartCard, { COLORS, tooltipStyle } from "./ChartCard.jsx";
import { aed, compact } from "../lib/format.js";

const aedTip = (v) => aed(v);

// Spend by Region and by Market (country). A ranked-bar view of the
// geographic split (a true choropleth map could be added later).
export default function GeoBreakdown({ byRegion, byMarket }) {
  return (
    <div className="chart-grid">
      <ChartCard title="Spend by Region (AED)">
        <BarChart data={byRegion} layout="vertical" margin={{ left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
          <XAxis type="number" stroke={COLORS.axis} tickFormatter={compact} />
          <YAxis type="category" dataKey="name" stroke={COLORS.axis} width={150} />
          <Tooltip contentStyle={tooltipStyle} formatter={aedTip} />
          <Bar dataKey="value" fill={COLORS.accent} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Spend by Market / Country (AED)">
        <BarChart data={byMarket} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
          <XAxis type="number" stroke={COLORS.axis} tickFormatter={compact} />
          <YAxis type="category" dataKey="name" stroke={COLORS.axis} width={90} />
          <Tooltip contentStyle={tooltipStyle} formatter={aedTip} />
          <Bar dataKey="value" fill={COLORS.accent2} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  );
}
