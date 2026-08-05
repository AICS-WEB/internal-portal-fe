import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import SearchInput from "../components/SearchInput.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

const statusOptions = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행" },
  { value: "closed", label: "종료" },
];

export default function ProjectsPage({ data, globalSearch }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const projects = useMemo(() => {
    const query = `${search} ${globalSearch}`.trim().toLowerCase();
    return data.researchProjects
      .filter((project) => status === "all" || project.status === status)
      .filter((project) => {
        if (!query) return true;
        return `${project.title} ${project.funding_agency} ${project.owner}`.toLowerCase().includes(query);
      });
  }, [data.researchProjects, globalSearch, search, status]);

  return (
    <div className="page-stack">
      <SectionHeader
        title="Projects"
        description="공개 연구과제 API에서 상태와 주요 기간을 조회합니다."
      />

      <section className="toolbar-panel">
        <SearchInput value={search} onChange={setSearch} placeholder="과제명, 지원기관, 담당자 검색" />
        <FilterTabs options={statusOptions} value={status} onChange={setStatus} />
      </section>

      <section className="card-grid">
        {projects.map((project) => (
          <article key={project.id} className="project-card">
            <div className="card-topline">
              <Badge value={project.status} />
              <span>{project.role}</span>
            </div>
            <h2>{project.title}</h2>
            <p>{project.funding_agency}</p>
            <dl className="meta-grid">
              <div>
                <dt>기간</dt>
                <dd>
                  {project.start_date} - {project.end_date}
                </dd>
              </div>
              <div>
                <dt>담당</dt>
                <dd>{project.owner}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
