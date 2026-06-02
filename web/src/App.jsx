import { useMemo, useRef, useState } from "react";
import { sampleData } from "./data/sampleData.js";
import { parseWorkbook, shapeRows } from "./lib/parseData.js";
import {
  uniqueValues,
  applyFilters,
  kpis,
  salesByProductLine,
  salesByHour,
  monthlyTrend,
} from "./lib/aggregations.js";
import { exportElementToPdf } from "./lib/exportPdf.js";
import Sidebar from "./components/Sidebar.jsx";
import Kpis from "./components/Kpis.jsx";
import Charts from "./components/Charts.jsx";

function dateBounds(rows) {
  const dates = rows.map((r) => r.dateObj).filter(Boolean);
  if (!dates.length) return { minDate: null, maxDate: null };
  return {
    minDate: new Date(Math.min(...dates)),
    maxDate: new Date(Math.max(...dates)),
  };
}

function initialFilters(rows) {
  const { minDate, maxDate } = dateBounds(rows);
  return {
    cities: [],
    customerTypes: [],
    genders: [],
    minDate,
    maxDate,
    dateStart: minDate,
    dateEnd: maxDate,
  };
}

export default function App() {
  const [rows, setRows] = useState(() => shapeRows(sampleData));
  const [sourceLabel, setSourceLabel] = useState("sample data");
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(() => initialFilters(shapeRows(sampleData)));
  const mainRef = useRef(null);

  const loadRows = (newRows, label) => {
    setRows(newRows);
    setSourceLabel(label);
    setFilters(initialFilters(newRows));
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
      cities: uniqueValues(rows, "City"),
      customerTypes: uniqueValues(rows, "Customer_type"),
      genders: uniqueValues(rows, "Gender"),
    }),
    [rows]
  );

  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const kpiData = useMemo(() => kpis(filtered), [filtered]);
  const byHour = useMemo(() => salesByHour(filtered), [filtered]);
  const byProductLine = useMemo(() => salesByProductLine(filtered), [filtered]);
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
        <h1 className="page-title">📊 Sales Dashboard</h1>

        {filtered.length === 0 ? (
          <p className="warning">No data available based on the current filter settings.</p>
        ) : (
          <>
            <Kpis data={kpiData} />

            {latest && latest.change != null && (
              <div className="trend-metric">
                <span className="trend-label">
                  Sales change vs. previous month ({latest.month})
                </span>
                <span className="trend-value">
                  US $ {latest.total.toLocaleString("en-US")}
                </span>
                <span className={"trend-delta " + (latest.change >= 0 ? "up" : "down")}>
                  {latest.change >= 0 ? "▲" : "▼"} {Math.abs(latest.change).toFixed(1)}%
                </span>
              </div>
            )}

            <Charts byHour={byHour} byProductLine={byProductLine} monthly={monthly} />
          </>
        )}
      </main>
    </div>
  );
}
