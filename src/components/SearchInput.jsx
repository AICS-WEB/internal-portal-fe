export default function SearchInput({ value, onChange, placeholder = "검색" }) {
  return (
    <label className="search-input">
      <span>검색</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}
