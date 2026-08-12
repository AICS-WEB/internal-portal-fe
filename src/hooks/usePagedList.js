import { useEffect, useState } from "react";

// Client-side paging for card/list sections (tables use DataTable's built-in paging).
// Resets to page 1 whenever the item count changes (filters/search), while keeping
// navigation stable across the re-created arrays that pages build each render.
export function usePagedList(items, pageSize = 9) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    pageItems,
    page: safePage,
    totalPages,
    onPrev: () => setPage((current) => Math.max(1, current - 1)),
    onNext: () => setPage((current) => Math.min(totalPages, current + 1)),
  };
}
