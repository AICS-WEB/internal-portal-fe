import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import SearchInput from "../components/SearchInput.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { formatCurrency } from "../utils/format.js";

const statusOptions = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행" },
  { value: "closed", label: "종료" },
];

export default function ProjectsPage({ data, actions, globalSearch }) {
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

  const openBudgetLink = (project) => {
    const budgetSummary = data.budgets
      .map((budget) => {
        const remaining = budget.total_budget - budget.used_amount;
        return `${budget.name}: ${formatCurrency(budget.used_amount)} 사용, ${formatCurrency(remaining)} 잔액`;
      })
      .join("\n");
    actions.openDetail("예산 연결 보기", {
      project: project.title,
      funding_agency: project.funding_agency,
      budget_summary: budgetSummary,
    });
  };

  return (
    <div className="page-stack">
      <SectionHeader
        title="Projects"
        description="연구과제 상태와 주요 기간을 카드로 관리합니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("researchProjects")}>
            과제 등록
          </Button>
        }
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
            <div className="button-row">
              <Button size="sm" variant="secondary" onClick={() => actions.openEdit("researchProjects", project)}>
                과제 수정
              </Button>
              <Button size="sm" variant="secondary" onClick={() => openBudgetLink(project)}>
                예산 연결 보기
              </Button>
              <Button size="sm" variant="danger" onClick={() => actions.deleteItem("researchProjects", project.id, "연구과제")}>
                과제 삭제
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
