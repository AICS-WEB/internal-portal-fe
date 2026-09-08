export default function FilterTabs({ options, value, onChange }) {
  return (
    <div className="filter-tabs" role="tablist">
      {options.map((option) => {
        const item = typeof option === "string" ? { value: option, label: option } : option;
        return (
          <button
            key={item.value}
            type="button"
            className={value === item.value ? "active" : ""}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
