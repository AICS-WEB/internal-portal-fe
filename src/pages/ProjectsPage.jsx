import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import Pagination from "../components/Pagination.jsx";
import SearchInput from "../components/SearchInput.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { usePagedList } from "../hooks/usePagedList.js";
import { formatLabel } from "../utils/format.js";
import { hasRole } from "../utils/permissions.js";

export default function ProjectsPage({ data, currentUser, actions, globalSearch }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const canManage = hasRole(currentUser, "manager");
  const statusOptions = useMemo(() => [
    { value: "all", label: "전체" },
    ...[...new Set(data.researchProjects.map((project) => project.status).filter(Boolean))]
      .map((value) => ({ value, label: formatLabel(value) })),
  ], [data.researchProjects]);

  const projects = useMemo(() => {
    const query = `${search} ${globalSearch}`.trim().toLowerCase();
    return data.researchProjects
      .filter((project) => status === "all" || project.status === status)
      .filter((project) => {
        if (!query) return true;
        return `${project.title} ${project.funding_agency} ${project.owner}`.toLowerCase().includes(query);
      });
  }, [data.researchProjects, globalSearch, search, status]);

  const { pageItems, page, totalPages, onPrev, onNext } = usePagedList(projects, 9);

  return (
    <div className="page-stack">
      <SectionHeader
        title="연구과제"
        description="내부 연구과제의 상태와 공개 여부를 관리합니다."
        actions={canManage ? (
          <Button variant="primary" onClick={() => actions.openCreate("researchProjects")}>과제 등록</Button>
        ) : null}
      />

      <section className="toolbar-panel">
        <SearchInput value={search} onChange={setSearch} placeholder="과제명, 지원기관, 담당자 검색" />
        <FilterTabs options={statusOptions} value={status} onChange={setStatus} />
      </section>

      <section className="card-grid">
        {pageItems.map((project) => (
          <article key={project.id} className="project-card">
            <div className="card-topline">
              <Badge value={project.status || "unknown"} />
              <Badge value={project.is_public ? "public" : "private"} />
            </div>
            <h2>{project.title}</h2>
            <p>{project.funding_agency || "-"}</p>
            <dl className="meta-grid">
              <div>
                <dt>기간</dt>
                <dd>
                  {project.start_date} - {project.end_date}
                </dd>
              </div>
              <div>
                <dt>담당</dt>
                <dd>{project.owner || "-"}</dd>
              </div>
              <div>
                <dt>사업 / 역할</dt>
                <dd>{project.program || "-"} / {project.role || "-"}</dd>
              </div>
            </dl>
            {canManage ? (
              <div className="table-actions">
                <Button size="sm" variant="secondary" onClick={() => actions.openEdit("researchProjects", project)}>수정</Button>
                <Button size="sm" variant="danger" onClick={() => actions.deleteItem("researchProjects", project.id, "연구과제")}>삭제</Button>
              </div>
            ) : null}
          </article>
        ))}
      </section>
      {totalPages > 1 ? <Pagination page={page} totalPages={totalPages} onPrev={onPrev} onNext={onNext} /> : null}
    </div>
  );
}
