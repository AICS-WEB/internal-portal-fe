export default function EmptyState({ title = "데이터가 없습니다.", description }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
