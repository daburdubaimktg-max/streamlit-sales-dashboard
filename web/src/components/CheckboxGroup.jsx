// A simple multi-select: a scrollable list of checkboxes. Empty selection
// means "all" (handled by the filtering logic).
export default function CheckboxGroup({ label, options, selected, onChange }) {
  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="filter-group">
      <label className="filter-label">{label}</label>
      <div className="checkbox-list">
        {options.map((opt) => (
          <label key={opt} className="checkbox-item">
            <input
              type="checkbox"
              checked={selected.length === 0 || selected.includes(opt)}
              onChange={() => toggle(opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
