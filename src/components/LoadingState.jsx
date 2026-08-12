export default function LoadingState({ title = "불러오는 중", description = "잠시만 기다려 주세요." }) {
  return (
    <div className="empty-state loading-state" aria-busy="true">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
