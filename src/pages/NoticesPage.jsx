import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import Pagination from "../components/Pagination.jsx";
import SearchInput from "../components/SearchInput.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

const categoryOptions = [
  { value: "all", label: "전체" },
  { value: "general", label: "일반" },
  { value: "important", label: "중요" },
  { value: "account_info", label: "계정" },
  { value: "schedule", label: "일정" },
];

export default function NoticesPage({ data, actions, globalSearch }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const filteredNotices = useMemo(() => {
    const query = `${search} ${globalSearch}`.trim().toLowerCase();
    return [...data.notices]
      .filter((notice) => category === "all" || notice.category === category)
      .filter((notice) => {
        if (!query) return true;
        return `${notice.title} ${notice.author} ${notice.content}`.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        if (sort === "views") return b.views - a.views;
        if (sort === "pinned") return Number(b.is_pinned) - Number(a.is_pinned);
        return b.created_at.localeCompare(a.created_at);
      });
  }, [category, data.notices, globalSearch, search, sort]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / pageSize));
  const currentRows = filteredNotices.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="page-stack">
      <SectionHeader
        title="Notices"
        description="AICS Lab 구성원을 위한 주요 공지와 운영 안내입니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("notices")}>
            공지 등록
          </Button>
        }
      />

      <section className="toolbar-panel">
        <SearchInput value={search} onChange={setSearch} placeholder="제목, 작성자, 내용 검색" />
        <FilterTabs options={categoryOptions} value={category} onChange={setCategory} />
        <select className="select-control" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="latest">최신순</option>
          <option value="views">조회순</option>
          <option value="pinned">고정 우선</option>
        </select>
      </section>

      <section className="notice-list" aria-label="공지사항 목록">
        {currentRows.map((notice) => (
          <article key={notice.id} className="notice-item">
            <div className="notice-main">
              <div className="notice-meta">
                <Badge value={notice.category} />
                {notice.is_pinned ? <Badge value="important">Pinned</Badge> : null}
                <span>{notice.created_at}</span>
                <span>{notice.author}</span>
                <span>조회 {notice.views}</span>
              </div>
              <h2>{notice.title}</h2>
              <p>{notice.content}</p>
            </div>
            <div className="item-actions quiet-actions">
              <Button size="sm" variant="secondary" onClick={() => actions.openDetail("공지 상세", notice)}>
                상세 보기
              </Button>
              <Button size="sm" variant="secondary" onClick={() => actions.openEdit("notices", notice)}>
                수정
              </Button>
              <Button size="sm" variant="secondary" onClick={() => actions.updateItem("notices", notice.id, { is_pinned: !notice.is_pinned })}>
                고정 토글
              </Button>
              <Button size="sm" variant="danger" onClick={() => actions.deleteItem("notices", notice.id, "공지사항")}>
                삭제
              </Button>
            </div>
          </article>
        ))}
      </section>
      <Pagination
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
      />
    </div>
  );
}
