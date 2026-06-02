import { useState } from "react";
import CheckboxGroup from "./CheckboxGroup.jsx";

export default function Sidebar({
  sourceLabel,
  options,
  filters,
  setFilters,
  onFile,
  onLoadUrl,
  onReset,
  onExportPdf,
  error,
}) {
  const [url, setUrl] = useState("");
  const update = (patch) => setFilters({ ...filters, ...patch });

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">📈 Marketing Performance</h2>

      <section className="sidebar-section">
        <label className="filter-label">Data</label>
        <label className="upload-btn">
          Upload Excel / CSV
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
            hidden
          />
        </label>

        <div className="url-row">
          <input
            className="text-input"
            type="text"
            placeholder="…or paste a public CSV/Excel URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="btn" onClick={() => url && onLoadUrl(url)}>
            Load
          </button>
        </div>

        <button className="btn btn-block" onClick={onReset}>
          🔄 Reset to sample data
        </button>
        <p className="source-label">Source: {sourceLabel}</p>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="sidebar-section">
        <CheckboxGroup
          label="Fiscal Year"
          options={options.fiscalYears}
          selected={filters.fiscalYears}
          onChange={(v) => update({ fiscalYears: v })}
        />
        <CheckboxGroup
          label="Platform"
          options={options.platforms}
          selected={filters.platforms}
          onChange={(v) => update({ platforms: v })}
        />
        <CheckboxGroup
          label="Category"
          options={options.categories}
          selected={filters.categories}
          onChange={(v) => update({ categories: v })}
        />
        <CheckboxGroup
          label="Region"
          options={options.regions}
          selected={filters.regions}
          onChange={(v) => update({ regions: v })}
        />
        <CheckboxGroup
          label="Brand"
          options={options.brands}
          selected={filters.brands}
          onChange={(v) => update({ brands: v })}
        />
      </section>

      <button className="btn btn-primary btn-block" onClick={onExportPdf}>
        📄 Download PDF report
      </button>
    </aside>
  );
}
