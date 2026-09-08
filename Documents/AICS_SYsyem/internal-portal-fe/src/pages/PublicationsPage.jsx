import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { canManageContent } from "../utils/permissions.js";

const statusOptions = [
  { value: "all", label: "전체" },
  { value: "writing", label: "작성 중" },
  { value: "submitted", label: "제출" },
  { value: "under_review", label: "심사 중" },
  { value: "accepted", label: "채택" },
  { value: "published", label: "출판" },
];

export default function PublicationsPage({ data, currentUser, actions }) {
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");
  const years = ["all", ...Array.from(new Set(data.publications.map((item) => item.year)))];

  const rows = useMemo(() => {
    return data.publications.filter((item) => {
      const yearMatch = year === "all" || item.year === year;
      const statusMatch = status === "all" || item.status === status;
      return yearMatch && statusMatch;
    });
  }, [data.publications, status, year]);

  const columns = [
    {
      key: "title",
      header: "논문",
      render: (item) => (
        <div className="cell-main">
          <strong>{item.title}</strong>
          <span>{item.authors_text}</span>
        </div>
      ),
    },
    { key: "year", header: "연도" },
    { key: "venue", header: "게재지" },
    { key: "pub_type", header: "유형" },
    { key: "status", header: "상태", render: (item) => <Badge value={item.status} /> },
    { key: "is_public", header: "공개", render: (item) => <Badge value={item.is_public ? "public" : "private"} /> },
    {
      key: "actions",
      header: "작업",
      render: (item) => (
        <div className="table-actions">
          {canManageContent(currentUser, item) ? <>
            <Button size="sm" variant="secondary" onClick={() => actions.openEdit("publications", item)}>논문 수정</Button>
            <Button size="sm" variant="secondary" onClick={() => actions.updateItem("publications", item.id, { is_public: !item.is_public })}>공개 토글</Button>
          </> : null}
          <Button size="sm" variant="secondary" onClick={() => actions.openPublicationDetail(item)}>
            상세 보기
          </Button>
          <Button size="sm" variant="secondary" onClick={() => actions.openPublicationFiles(item)}>
            파일 관리
          </Button>
          {canManageContent(currentUser, item) ? <Button size="sm" variant="danger" onClick={() => actions.deleteItem("publications", item.id, "논문")}>
            논문 삭제
          </Button> : null}
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader
        title="논문"
        description="논문과 연구 성과의 상태, 공개 여부를 관리합니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("publications")}>
            논문 등록
          </Button>
        }
      />

      <section className="toolbar-panel">
        <select className="select-control" value={year} onChange={(event) => setYear(event.target.value)}>
          {years.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "전체 연도" : item}
            </option>
          ))}
        </select>
        <FilterTabs options={statusOptions} value={status} onChange={setStatus} />
      </section>

      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
