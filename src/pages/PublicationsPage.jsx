import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

const statusOptions = [
  { value: "all", label: "전체" },
  { value: "writing", label: "작성 중" },
  { value: "submitted", label: "제출" },
  { value: "under_review", label: "심사 중" },
  { value: "accepted", label: "채택" },
  { value: "published", label: "출판" },
];

export default function PublicationsPage({ data, actions }) {
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

  return (
    <div className="page-stack">
      <SectionHeader
        title="Publications"
        description="Publications 리스트처럼 성과를 citation 중심으로 정리합니다."
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

      <section className="citation-list">
        {rows.map((item) => (
          <article key={item.id} className="citation-item">
            <div className="citation-main">
              <h2>{item.title}</h2>
              <p className="authors">{item.authors_text}</p>
              <p>
                <strong>{item.venue}</strong>, {item.year}
                {item.published_date ? ` · ${item.published_date}` : ""}
              </p>
              <div className="notice-meta">
                <Badge value={item.pub_type} />
                <Badge value={item.status} />
                <Badge value={item.is_public ? "public" : "private"} />
              </div>
            </div>
            <div className="item-actions quiet-actions">
              {item.doi ? (
                <Button size="sm" variant="secondary" onClick={() => actions.copyText(item.doi, "DOI가 복사되었습니다.")}>
                  DOI
                </Button>
              ) : null}
              <Button size="sm" variant="secondary" onClick={() => actions.openEdit("publications", item)}>
                논문 수정
              </Button>
              <Button size="sm" variant="secondary" onClick={() => actions.updateItem("publications", item.id, { is_public: !item.is_public })}>
                공개 토글
              </Button>
              <Button size="sm" variant="secondary" onClick={() => actions.showToast("첨부파일 목록을 확인했습니다.")}>
                첨부파일 보기
              </Button>
              <Button size="sm" variant="danger" onClick={() => actions.deleteItem("publications", item.id, "논문")}>
                삭제
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
