import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { usd, compact } from "../lib/format.js";

const ACCENT = "#0083B8";
const ACCENT_2 = "#E694FF";
const tooltipStyle = {
  backgroundColor: "#0E2A3F",
  border: "1px solid #0083B8",
  color: "#FFF",
};
const usdTip = (v) => usd(v);

function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export default function Charts({ byPlatform, byCategory, topBrandList, monthly }) {
  return (
    <>
      <div className="chart-grid">
        <ChartCard title="Spend by Platform (USD)">
          <BarChart data={byPlatform}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c3a52" vertical={false} />
            <XAxis dataKey="name" stroke="#9fb6c6" interval={0} angle={-25} textAnchor="end" height={60} />
            <YAxis stroke="#9fb6c6" tickFormatter={compact} />
            <Tooltip contentStyle={tooltipStyle} formatter={usdTip} />
            <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Spend by Category (USD)">
          <BarChart data={byCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c3a52" vertical={false} />
            <XAxis dataKey="name" stroke="#9fb6c6" interval={0} angle={-25} textAnchor="end" height={60} />
            <YAxis stroke="#9fb6c6" tickFormatter={compact} />
            <Tooltip contentStyle={tooltipStyle} formatter={usdTip} />
            <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="chart-grid">
        <ChartCard title="Top 10 Brands by Spend (USD)">
          <BarChart data={topBrandList} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c3a52" horizontal={false} />
            <XAxis type="number" stroke="#9fb6c6" tickFormatter={compact} />
            <YAxis type="category" dataKey="name" stroke="#9fb6c6" width={130} />
            <Tooltip contentStyle={tooltipStyle} formatter={usdTip} />
            <Bar dataKey="value" fill={ACCENT} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        {monthly.length > 1 && (
          <ChartCard title="Monthly Spend Trend (USD)">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c3a52" />
              <XAxis dataKey="label" stroke="#9fb6c6" />
              <YAxis stroke="#9fb6c6" tickFormatter={compact} />
              <Tooltip contentStyle={tooltipStyle} formatter={usdTip} />
              <Line type="monotone" dataKey="spend" stroke={ACCENT_2} strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ChartCard>
        )}
      </div>
    </>
  );
}
