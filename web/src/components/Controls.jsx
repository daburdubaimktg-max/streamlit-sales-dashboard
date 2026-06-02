import { METRICS } from "../lib/aggregations.js";

// Controls for the comparison views: period basis, which periods are
// "this year" / "last year", and which metric to break down.
export default function Controls({ basis, setBasis, periodList, ty, ly, setTy, setLy, metricKey, setMetricKey }) {
  return (
    <div className="controls">
      <div className="control">
        <label>Period basis</label>
        <select value={basis} onChange={(e) => setBasis(e.target.value)}>
          <option value="fiscal">Fiscal Year</option>
          <option value="calendar">Calendar Year</option>
        </select>
      </div>
      <div className="control">
        <label>This year (TY)</label>
        <select value={ty} onChange={(e) => setTy(e.target.value)}>
          {periodList.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="control">
        <label>Last year (LY)</label>
        <select value={ly} onChange={(e) => setLy(e.target.value)}>
          {periodList.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="control">
        <label>Comparison metric</label>
        <select value={metricKey} onChange={(e) => setMetricKey(e.target.value)}>
          {Object.entries(METRICS).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </select>
      </div>
    </div>
  );
}
