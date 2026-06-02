const usd = (n) =>
  "US $ " + Math.round(n).toLocaleString("en-US");

export default function Kpis({ data }) {
  const stars = "★".repeat(Math.round(data.averageRating));
  return (
    <div className="kpi-row">
      <div className="kpi-card">
        <div className="kpi-label">Total Sales</div>
        <div className="kpi-value">{usd(data.totalSales)}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Average Rating</div>
        <div className="kpi-value">
          {data.averageRating.toFixed(1)} <span className="stars">{stars}</span>
        </div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Average Sales / Transaction</div>
        <div className="kpi-value">{usd(data.averageSale)}</div>
      </div>
    </div>
  );
}
