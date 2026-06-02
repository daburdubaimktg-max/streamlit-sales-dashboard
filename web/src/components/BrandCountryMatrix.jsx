// Brand × Country heatmap table for the selected period & metric.
export default function BrandCountryMatrix({ matrix, metric, periodLabel }) {
  const { brands, countries, matrix: rows, max } = matrix;

  if (!brands.length || !countries.length) {
    return <p className="muted-text">Not enough data for a brand × country breakdown in this period.</p>;
  }

  // Blue shade scaled to the largest cell.
  const bg = (v) => {
    const t = max ? v / max : 0;
    return `rgba(0, 131, 184, ${0.12 + t * 0.78})`;
  };

  return (
    <div className="matrix-wrap">
      <table className="matrix">
        <thead>
          <tr>
            <th className="matrix-corner">Brand \ Country</th>
            {countries.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.brand}>
              <th className="matrix-brand">{row.brand}</th>
              {row.cells.map((v, i) => (
                <td key={i} style={{ backgroundColor: v ? bg(v) : "transparent" }}>
                  {v ? metric.fmt(v) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted-text">
        {metric.label} by top brands × top countries for {periodLabel}. Darker = higher.
      </p>
    </div>
  );
}
