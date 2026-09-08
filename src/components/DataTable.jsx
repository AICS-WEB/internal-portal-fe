import { useEffect, useState } from "react";
import EmptyState from "./EmptyState.jsx";
import Pagination from "./Pagination.jsx";

export default function DataTable({
  columns,
  rows,
  emptyTitle = "표시할 데이터가 없습니다.",
  pageSize = 8,
  paginate = true,
}) {
  const [page, setPage] = useState(1);

  // Reset to the first page whenever the underlying row count changes
  // (e.g. filters/search applied). Depending on length keeps navigation
  // working even though pages rebuild the `rows` array on every render.
  useEffect(() => {
    setPage(1);
  }, [rows.length]);

  if (!rows.length) {
    return <EmptyState title={emptyTitle} />;
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRows = paginate ? rows.slice((safePage - 1) * pageSize, safePage * pageSize) : rows;

  return (
    <div className="table-stack">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key} data-label={column.header}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginate && totalPages > 1 ? (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPrev={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
        />
      ) : null}
    </div>
  );
}
