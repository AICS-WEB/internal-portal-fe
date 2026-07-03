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
        description="Research Projects 섹션처럼 과제의 주제, 지원기관, 기간을 중심으로 정리합니다."
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

      <section className="research-list">
        {projects.map((project) => (
          <article key={project.id} className="research-item">
            <div className="research-content">
              <div className="notice-meta">
                <Badge value={project.status} />
                <span>{project.funding_agency}</span>
                <span>{project.role}</span>
              </div>
              <h2>{project.title}</h2>
              <dl className="meta-grid">
                <div>
                  <dt>Period</dt>
                  <dd>
                    {project.start_date} - {project.end_date}
                  </dd>
                </div>
                <div>
                  <dt>Lead</dt>
                  <dd>{project.owner}</dd>
                </div>
              </dl>
            </div>
            <div className="item-actions quiet-actions">
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
