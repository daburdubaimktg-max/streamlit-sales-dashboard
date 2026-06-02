import { useMemo, useRef, useState } from "react";
import { sampleData } from "./data/sampleData.js";
import { parseWorkbook, shapeRows } from "./lib/parseData.js";
import {
  uniqueValues,
  applyFilters,
  kpis,
  spendByPlatform,
  spendByCategory,
  topBrands,
  monthlyTrend,
} from "./lib/aggregations.js";
import { exportElementToPdf } from "./lib/exportPdf.js";
import { usdFull } from "./lib/format.js";
import Sidebar from "./components/Sidebar.jsx";
import Kpis from "./components/Kpis.jsx";
import Charts from "./components/Charts.jsx";

const emptyFilters = {
  fiscalYears: [],
  platforms: [],
  categories: [],
  brands: [],
  regions: [],
};

export default function App() {
  const [rows, setRows] = useState(() => shapeRows(sampleData));
  const [sourceLabel, setSourceLabel] = useState("sample data");
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const mainRef = useRef(null);

  const loadRows = (newRows, label) => {
    setRows(newRows);
    setSourceLabel(label);
    setFilters(emptyFilters);
    setError("");
  };

  const handleFile = async (file) => {
    try {
      const buf = await file.arrayBuffer();
      loadRows(parseWorkbook(new Uint8Array(buf)), `uploaded: ${file.name}`);
    } catch (e) {
      setError(e.message || "Could not read that file.");
    }
  };

  const handleLoadUrl = async (url) => {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Request failed (${resp.status}).`);
      const buf = await resp.arrayBuffer();
      loadRows(parseWorkbook(new Uint8Array(buf)), "public URL (live)");
    } catch (e) {
      setError(
        (e.message || "Could not load that URL.") +
          " If it's a private/CORS-blocked link, download it and upload instead."
      );
    }
  };

  const handleReset = () => loadRows(shapeRows(sampleData), "sample data");
  const handleExportPdf = () => {
    if (mainRef.current) exportElementToPdf(mainRef.current);
  };

  const options = useMemo(
    () => ({
      fiscalYears: uniqueValues(rows, "fiscalYear"),
      platforms: uniqueValues(rows, "platform"),
      categories: uniqueValues(rows, "category"),
      brands: uniqueValues(rows, "brand"),
      regions: uniqueValues(rows, "region"),
    }),
    [rows]
  );

  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const kpiData = useMemo(() => kpis(filtered), [filtered]);
  const byPlatform = useMemo(() => spendByPlatform(filtered), [filtered]);
  const byCategory = useMemo(() => spendByCategory(filtered), [filtered]);
  const topBrandList = useMemo(() => topBrands(filtered), [filtered]);
  const monthly = useMemo(() => monthlyTrend(filtered), [filtered]);

  const latest = monthly.length ? monthly[monthly.length - 1] : null;

  return (
    <div className="app">
      <Sidebar
        sourceLabel={sourceLabel}
        options={options}
        filters={filters}
        setFilters={setFilters}
        onFile={handleFile}
        onLoadUrl={handleLoadUrl}
        onReset={handleReset}
        onExportPdf={handleExportPdf}
        error={error}
      />

      <main className="main" ref={mainRef}>
        <h1 className="page-title">📈 Marketing Performance Dashboard</h1>

        {filtered.length === 0 ? (
          <p className="warning">No data available based on the current filter settings.</p>
        ) : (
          <>
            <Kpis data={kpiData} />

            {latest && latest.change != null && (
              <div className="trend-metric">
                <span className="trend-label">
                  Spend change vs. previous month ({latest.label})
                </span>
                <span className="trend-value">{usdFull(latest.spend)}</span>
                <span className={"trend-delta " + (latest.change >= 0 ? "up" : "down")}>
                  {latest.change >= 0 ? "▲" : "▼"} {Math.abs(latest.change).toFixed(1)}%
                </span>
              </div>
            )}

            <Charts
              byPlatform={byPlatform}
              byCategory={byCategory}
              topBrandList={topBrandList}
              monthly={monthly}
            />
          </>
        )}
      </main>
    </div>
  );
}
