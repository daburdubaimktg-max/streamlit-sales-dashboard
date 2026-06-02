import { useState } from "react";
import CheckboxGroup from "./CheckboxGroup.jsx";

const toInput = (d) => (d ? d.toISOString().slice(0, 10) : "");

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
      <h2 className="sidebar-title">📊 Sales Dashboard</h2>

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
        <label className="filter-label">Date range</label>
        <div className="date-row">
          <input
            type="date"
            className="text-input"
            value={toInput(filters.dateStart)}
            min={toInput(filters.minDate)}
            max={toInput(filters.maxDate)}
            onChange={(e) =>
              update({ dateStart: e.target.value ? new Date(e.target.value) : null })
            }
          />
          <span>to</span>
          <input
            type="date"
            className="text-input"
            value={toInput(filters.dateEnd)}
            min={toInput(filters.minDate)}
            max={toInput(filters.maxDate)}
            onChange={(e) =>
              update({ dateEnd: e.target.value ? new Date(e.target.value) : null })
            }
          />
        </div>
      </section>

      <section className="sidebar-section">
        <CheckboxGroup
          label="City"
          options={options.cities}
          selected={filters.cities}
          onChange={(v) => update({ cities: v })}
        />
        <CheckboxGroup
          label="Customer type"
          options={options.customerTypes}
          selected={filters.customerTypes}
          onChange={(v) => update({ customerTypes: v })}
        />
        <CheckboxGroup
          label="Gender"
          options={options.genders}
          selected={filters.genders}
          onChange={(v) => update({ genders: v })}
        />
      </section>

      <button className="btn btn-primary btn-block" onClick={onExportPdf}>
        📄 Download PDF report
      </button>
    </aside>
  );
}
