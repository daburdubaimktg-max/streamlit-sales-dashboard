import { useMemo, useRef, useState, useEffect } from "react";
import { sampleData } from "./data/sampleData.js";
import { parseWorkbook, shapeRows } from "./lib/parseData.js";
import {
  METRICS, uniqueValues, applyFilters, kpis,
  spendByPlatform, spendByCategory, topBrands, spendByRegion, spendByMarket,
  platformEfficiency, monthlyTrend,
  periods, periodTotals, quarterCompare, dimensionCompare, brandCountryMatrix,
} from "./lib/aggregations.js";
import { exportElementToPdf } from "./lib/exportPdf.js";
import Sidebar from "./components/Sidebar.jsx";
import Controls from "./components/Controls.jsx";
import Kpis from "./components/Kpis.jsx";
import Charts from "./components/Charts.jsx";
import PlatformEfficiency from "./components/PlatformEfficiency.jsx";
import GeoBreakdown from "./components/GeoBreakdown.jsx";
import Comparisons from "./components/Comparisons.jsx";
import BrandCountryMatrix from "./components/BrandCountryMatrix.jsx";

const emptyFilters = {
  fiscalYears: [], platforms: [], categories: [], brands: [], regions: [],
};

export default function App() {
  const [rows, setRows] = useState(() => shapeRows(sampleData));
  const [sourceLabel, setSourceLabel] = useState("sample data");
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(emptyFilters);

  // Comparison controls.
  const [basis, setBasis] = useState("fiscal");
  const [metricKey, setMetricKey] = useState("spend");
  const [ty, setTy] = useState("");
  const [ly, setLy] = useState("");

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
      setError((e.message || "Could not load that URL.") +
        " If it's a private/CORS-blocked link, download it and upload instead.");
    }
  };

  const handleReset = () => loadRows(shapeRows(sampleData), "sample data");
  const handleExportPdf = () => mainRef.current && exportElementToPdf(mainRef.current);

  const options = useMemo(() => ({
    fiscalYears: uniqueValues(rows, "fiscalYear"),
    platforms: uniqueValues(rows, "platform"),
    categories: uniqueValues(rows, "category"),
    brands: uniqueValues(rows, "brand"),
    regions: uniqueValues(rows, "region"),
  }), [rows]);

  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);

  // Period list depends on basis + the filtered data; default TY/LY to the
  // two most recent periods whenever that list changes.
  const periodList = useMemo(() => periods(filtered, basis), [filtered, basis]);
  useEffect(() => {
    if (!periodList.length) return;
    const last = periodList[periodList.length - 1];
    const prev = periodList[periodList.length - 2] || last;
    if (!periodList.includes(ty)) setTy(last);
    if (!periodList.includes(ly)) setLy(prev);
  }, [periodList]); // eslint-disable-line react-hooks/exhaustive-deps

  const metric = METRICS[metricKey];

  // Overview aggregates.
  const kpiData = useMemo(() => kpis(filtered), [filtered]);
  const byPlatform = useMemo(() => spendByPlatform(filtered), [filtered]);
  const byCategory = useMemo(() => spendByCategory(filtered), [filtered]);
  const topBrandList = useMemo(() => topBrands(filtered), [filtered]);
  const byRegion = useMemo(() => spendByRegion(filtered), [filtered]);
  const byMarket = useMemo(() => spendByMarket(filtered), [filtered]);
  const efficiency = useMemo(() => platformEfficiency(filtered), [filtered]);
  const monthly = useMemo(() => monthlyTrend(filtered), [filtered]);

  // Comparison aggregates.
  const ptotals = useMemo(() => periodTotals(filtered, basis), [filtered, basis]);
  const tyRow = ptotals.find((p) => p.period === ty) || null;
  const lyRow = ptotals.find((p) => p.period === ly) || null;
  const quarterData = useMemo(
    () => quarterCompare(filtered, basis, ly, ty, metricKey), [filtered, basis, ly, ty, metricKey]);
  const countryData = useMemo(
    () => dimensionCompare(filtered, basis, ly, ty, "market", metricKey, 12), [filtered, basis, ly, ty, metricKey]);
  const brandData = useMemo(
    () => dimensionCompare(filtered, basis, ly, ty, "brand", metricKey, 12), [filtered, basis, ly, ty, metricKey]);
  const matrix = useMemo(
    () => brandCountryMatrix(filtered, basis, ty, metricKey, 8, 8), [filtered, basis, ty, metricKey]);

  return (
    <div className="app">
      <Sidebar
        sourceLabel={sourceLabel} options={options} filters={filters} setFilters={setFilters}
        onFile={handleFile} onLoadUrl={handleLoadUrl} onReset={handleReset}
        onExportPdf={handleExportPdf} error={error}
      />

      <main className="main" ref={mainRef}>
        <h1 className="page-title">📈 Marketing Performance Dashboard</h1>

        {filtered.length === 0 ? (
          <p className="warning">No data available based on the current filter settings.</p>
        ) : (
          <>
            <h2 className="section-title">Overview (all selected data)</h2>
            <Kpis data={kpiData} />
            <Charts byPlatform={byPlatform} byCategory={byCategory}
              topBrandList={topBrandList} monthly={monthly} />

            <h2 className="section-title">Platform Efficiency</h2>
            <PlatformEfficiency data={efficiency} />

            <h2 className="section-title">Geographic Breakdown</h2>
            <GeoBreakdown byRegion={byRegion} byMarket={byMarket} />

            <h2 className="section-title">Comparisons</h2>
            <Controls
              basis={basis} setBasis={setBasis} periodList={periodList}
              ty={ty} ly={ly} setTy={setTy} setLy={setLy}
              metricKey={metricKey} setMetricKey={setMetricKey}
            />
            <Comparisons
              periodTotals={ptotals} ly={lyRow} ty={tyRow} lyLabel={ly} tyLabel={ty}
              metric={metric} quarterData={quarterData}
              countryData={countryData} brandData={brandData}
            />

            <h2 className="section-title">Brand × Country — {metric.label} ({ty})</h2>
            <BrandCountryMatrix matrix={matrix} metric={metric} periodLabel={ty} />
          </>
        )}
      </main>
    </div>
  );
}
