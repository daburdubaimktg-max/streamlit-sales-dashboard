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

const ACCENT = "#0083B8";
const tooltipStyle = {
  backgroundColor: "#0E2A3F",
  border: "1px solid #0083B8",
  color: "#FFF",
};
const fmt = (n) => "US $ " + Number(n).toLocaleString("en-US");

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

export default function Charts({ byHour, byProductLine, monthly }) {
  return (
    <>
      <div className="chart-grid">
        <ChartCard title="Sales by Hour">
          <BarChart data={byHour}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c3a52" vertical={false} />
            <XAxis dataKey="hour" stroke="#9fb6c6" />
            <YAxis stroke="#9fb6c6" />
            <Tooltip contentStyle={tooltipStyle} formatter={fmt} />
            <Bar dataKey="total" fill={ACCENT} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Sales by Product Line">
          <BarChart data={byProductLine} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c3a52" horizontal={false} />
            <XAxis type="number" stroke="#9fb6c6" />
            <YAxis type="category" dataKey="name" stroke="#9fb6c6" width={120} />
            <Tooltip contentStyle={tooltipStyle} formatter={fmt} />
            <Bar dataKey="total" fill={ACCENT} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      {monthly.length > 1 && (
        <ChartCard title="Month-over-Month Sales Trend">
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c3a52" />
            <XAxis dataKey="month" stroke="#9fb6c6" />
            <YAxis stroke="#9fb6c6" />
            <Tooltip contentStyle={tooltipStyle} formatter={fmt} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#E694FF"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartCard>
      )}
    </>
  );
}
