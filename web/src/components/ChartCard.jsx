import { ResponsiveContainer } from "recharts";

export const COLORS = {
  accent: "#0083B8", // TY / primary
  accent2: "#E694FF", // trend / secondary metric
  ly: "#5A7A8C", // last year (muted)
  ty: "#0083B8", // this year
  line: "#FFD166", // overlaid line metric
  grid: "#1c3a52",
  axis: "#9fb6c6",
};

export const tooltipStyle = {
  backgroundColor: "#0E2A3F",
  border: "1px solid #0083B8",
  color: "#FFF",
};

export default function ChartCard({ title, subtitle, children, height = 300 }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
