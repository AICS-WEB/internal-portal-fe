export default function StatCard({ label, value, note, tone = "primary" }) {
  const glyphs = { primary: "◈", warning: "⌁", indigo: "◌", success: "✓" };

  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-card-heading">
        <p className="stat-label">{label}</p>
        <span className="stat-glyph" aria-hidden="true">{glyphs[tone] || glyphs.primary}</span>
      </div>
      <strong>{value}</strong>
      {note ? <span>{note}</span> : null}
    </article>
  );
}
