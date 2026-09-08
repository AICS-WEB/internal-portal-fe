import Button from "./Button.jsx";

export default function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="pagination">
      <Button variant="secondary" size="sm" onClick={onPrev} disabled={page <= 1}>
        이전
      </Button>
      <span>
        {page} / {totalPages}
      </span>
      <Button variant="secondary" size="sm" onClick={onNext} disabled={page >= totalPages}>
        다음
      </Button>
    </div>
  );
}
