import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import ChartCard, { COLORS, tooltipStyle } from "./ChartCard.jsx";
import { aed, compact } from "../lib/format.js";

const aedTip = (v) => aed(v);
const angledX = { interval: 0, angle: -25, textAnchor: "end", height: 60 };

export default function Charts({ byPlatform, byCategory, topBrandList, monthly }) {
  return (
    <>
      <div className="chart-grid">
        <ChartCard title="Spend by Platform (AED)">
          <BarChart data={byPlatform}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis dataKey="name" stroke={COLORS.axis} {...angledX} />
            <YAxis stroke={COLORS.axis} tickFormatter={compact} />
            <Tooltip contentStyle={tooltipStyle} formatter={aedTip} />
            <Bar dataKey="value" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Spend by Category (AED)">
          <BarChart data={byCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis dataKey="name" stroke={COLORS.axis} {...angledX} />
            <YAxis stroke={COLORS.axis} tickFormatter={compact} />
            <Tooltip contentStyle={tooltipStyle} formatter={aedTip} />
            <Bar dataKey="value" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="chart-grid">
        <ChartCard title="Top 10 Brands by Spend (AED)">
          <BarChart data={topBrandList} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
            <XAxis type="number" stroke={COLORS.axis} tickFormatter={compact} />
            <YAxis type="category" dataKey="name" stroke={COLORS.axis} width={130} />
            <Tooltip contentStyle={tooltipStyle} formatter={aedTip} />
            <Bar dataKey="value" fill={COLORS.accent} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        {monthly.length > 1 && (
          <ChartCard title="Monthly Spend Trend (AED)">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="label" stroke={COLORS.axis} />
              <YAxis stroke={COLORS.axis} tickFormatter={compact} />
              <Tooltip contentStyle={tooltipStyle} formatter={aedTip} />
              <Line type="monotone" dataKey="spend" stroke={COLORS.accent2} strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ChartCard>
        )}
      </div>
    </>
  );
}
