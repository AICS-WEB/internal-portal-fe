import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SearchInput from "../components/SearchInput.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function SearchPage({ data, actions }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return [
      ...data.notices.map((item) => ({ id: `notice-${item.id}`, type: "공지", title: item.title, detail: item.author, raw: item })),
      ...data.calendarEvents.map((item) => ({ id: `event-${item.id}`, type: "일정", title: item.title, detail: item.location, raw: item })),
      ...data.publications.map((item) => ({ id: `publication-${item.id}`, type: "논문", title: item.title, detail: item.authors_text, raw: item })),
      ...data.sharedFiles.map((item) => ({ id: `file-${item.id}`, type: "파일", title: item.title, detail: item.filename, raw: item })),
    ].filter((item) => `${item.title || ""} ${item.detail || ""}`.toLowerCase().includes(needle));
  }, [data, query]);

  return (
    <div className="page-stack">
      <SectionHeader title="Search" description="현재 불러온 공지, 일정, 논문, 파일을 통합 검색합니다." />
      <section className="search-workspace">
        <SearchInput value={query} onChange={setQuery} placeholder="검색어를 입력하세요" />
        {query ? <span className="search-count">검색 결과 {results.length}건</span> : null}
      </section>
      <section className="search-results">
        {results.map((item) => (
          <button type="button" key={item.id} className="search-result-row" onClick={() => actions.openDetail(`${item.type} 상세`, item.raw)}>
            <Badge value="general">{item.type}</Badge>
            <span><strong>{item.title}</strong><small>{item.detail || "세부 정보 없음"}</small></span>
            <span aria-hidden="true">›</span>
          </button>
        ))}
        {!query ? <EmptyState title="통합 검색" description="검색어를 입력하면 실제 API로 불러온 데이터 안에서 결과를 찾습니다." /> : null}
        {query && !results.length ? <EmptyState title="검색 결과가 없습니다." description="다른 검색어로 다시 시도해 보세요." /> : null}
      </section>
    </div>
  );
}
