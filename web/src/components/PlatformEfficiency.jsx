import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import ChartCard, { COLORS, tooltipStyle } from "./ChartCard.jsx";

// Combination chart: CPM (AED) as bars + CTR (%) as a line, on dual axes.
export default function PlatformEfficiency({ data }) {
  const fmt = (value, name) =>
    name === "CTR (%)" ? value.toFixed(2) + "%" : value.toFixed(2) + " AED";

  return (
    <ChartCard
      title="CTR & CPM by Platform"
      subtitle="Bars = CPM in AED (cost per 1,000 impressions) · Line = CTR % — both computed from summed totals"
    >
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="name" stroke={COLORS.axis} interval={0} angle={-25} textAnchor="end" height={60} />
        <YAxis yAxisId="left" stroke={COLORS.axis} />
        <YAxis yAxisId="right" orientation="right" stroke={COLORS.line} tickFormatter={(v) => v + "%"} />
        <Tooltip contentStyle={tooltipStyle} formatter={fmt} />
        <Legend />
        <Bar yAxisId="left" dataKey="cpm" name="CPM (AED)" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" dataKey="ctr" name="CTR (%)" stroke={COLORS.line} strokeWidth={3} dot={{ r: 3 }} />
      </ComposedChart>
    </ChartCard>
  );
}
