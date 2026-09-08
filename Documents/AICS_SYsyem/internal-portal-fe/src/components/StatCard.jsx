export default function StatCard({ label, value, note, tone = "primary" }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <p className="stat-label">{label}</p>
      <strong>{value}</strong>
      {note ? <span>{note}</span> : null}
    </article>
  );
}
