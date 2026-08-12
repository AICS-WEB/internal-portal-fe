export default function StatCard({ label, value, note, tone = "primary", icon, deltaTone }) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <p className="stat-label">{label}</p>
        {icon ? <span className={`stat-ico stat-ico-${tone}`}>{icon}</span> : null}
      </div>
      <strong>{value}</strong>
      {note ? <span className={`stat-note${deltaTone ? ` stat-note-${deltaTone}` : ""}`}>{note}</span> : null}
    </article>
  );
}
