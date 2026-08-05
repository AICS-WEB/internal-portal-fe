import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import Pagination from "../components/Pagination.jsx";
import SearchInput from "../components/SearchInput.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { hasRole } from "../utils/permissions.js";

const categoryOptions = [
  { value: "all", label: "전체" },
  { value: "general", label: "일반" },
  { value: "important", label: "중요" },
  { value: "account_info", label: "계정" },
  { value: "schedule", label: "일정" },
];

export default function NoticesPage({ data, currentUser, actions, globalSearch }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const canManage = hasRole(currentUser, "manager");

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

  const columns = [
    {
      key: "title",
      header: "제목",
      render: (notice) => (
        <div className="cell-main">
          <strong>{notice.title}</strong>
          <span>{notice.content}</span>
        </div>
      ),
    },
    { key: "author", header: "작성자" },
    { key: "category", header: "카테고리", render: (notice) => <Badge value={notice.category} /> },
    { key: "is_pinned", header: "고정", render: (notice) => (notice.is_pinned ? "고정" : "-") },
    { key: "views", header: "조회수" },
    { key: "created_at", header: "작성일" },
    {
      key: "actions",
      header: "작업",
      render: (notice) => (
        <div className="table-actions">
          <Button size="sm" variant="secondary" onClick={() => actions.openNoticeDetail(notice)}>
            상세 보기
          </Button>
          {canManage ? (
            <>
              <Button size="sm" variant="secondary" onClick={() => actions.updateItem("notices", notice.id, { is_pinned: !notice.is_pinned })}>
                {notice.is_pinned ? "고정 해제" : "상단 고정"}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => actions.openNoticeEdit(notice)}>수정</Button>
              <Button size="sm" variant="danger" onClick={() => actions.deleteItem("notices", notice.id, "공지")}>삭제</Button>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader
        title="공지사항"
        description="연구실 공지, 계정 안내, 일정 안내를 한 곳에서 관리합니다."
        actions={canManage ? (
          <Button variant="primary" onClick={() => actions.openCreate("notices")}>
            공지 등록
          </Button>
        ) : null}
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

      <DataTable columns={columns} rows={currentRows} />
      <Pagination
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
      />
    </div>
  );
}
