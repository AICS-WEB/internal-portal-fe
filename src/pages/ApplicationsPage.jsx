import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SearchInput from "../components/SearchInput.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { hasRole } from "../utils/permissions.js";

const stages = [
  { id: "pending", label: "Pending" },
  { id: "reviewing", label: "Reviewing" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

function ApplicationCard({ item, onDetail, onReview }) {
  return (
    <article className="application-card">
      <div className="application-card-head">
        <span className="application-avatar">{String(item.name || "A").slice(0, 1)}</span>
        <div>
          <h3>{item.name || "이름 없음"}</h3>
          <p>{item.department || item.email || "학과 정보 없음"}</p>
        </div>
      </div>
      <dl className="application-meta">
        <div><dt>지원 학기</dt><dd>{item.target_term || "-"}</dd></div>
        <div><dt>지원일</dt><dd>{String(item.created_at || "-").slice(0, 10)}</dd></div>
      </dl>
      <div className="application-card-actions">
        <Button size="sm" variant="secondary" onClick={() => onDetail(item)}>상세</Button>
        <Button size="sm" variant="primary" onClick={() => onReview(item)}>상태 변경</Button>
      </div>
    </article>
  );
}

export default function ApplicationsPage({ data, actions, resourceState, currentUser }) {
  const [view, setView] = useState("board");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data.applications;
    return data.applications.filter((item) =>
      `${item.name || ""} ${item.email || ""} ${item.department || ""} ${item.target_term || ""}`.toLowerCase().includes(needle),
    );
  }, [data.applications, query]);

  const openDetail = async (item) => {
    try {
      const detail = await actions.api.applicationsApi.getApplication(item.id);
      actions.openDetail("지원서 상세", detail);
      await actions.refreshResource("applications");
    } catch (error) {
      actions.showToast(error.message || "지원서 상세 조회에 실패했습니다.", "warning");
    }
  };

  const openReview = (item) => {
    actions.openForm({
      title: "지원 상태 변경",
      description: `${item.name || "지원자"}의 지원 상태와 내부 메모를 업데이트합니다.`,
      fields: [
        { name: "status", label: "상태", type: "select", options: stages.map((stage) => stage.id) },
        { name: "internalMemo", label: "내부 메모", type: "textarea" },
      ],
      initialValues: { status: item.status || "pending", internalMemo: item.internal_memo || "" },
      submitLabel: "저장",
      successMessage: "지원 상태가 변경되었습니다.",
      onSubmit: async (values) => {
        await actions.api.applicationsApi.updateApplication(item.id, values);
        await actions.refreshResource("applications");
      },
    });
  };

  if (!hasRole(currentUser, "manager")) {
    return <EmptyState title="접근 권한이 없습니다." description="Applications는 manager 이상만 사용할 수 있습니다." />;
  }

  return (
    <div className="page-stack">
      <SectionHeader title="Applications" description="지원자의 검토 흐름을 상태별로 확인하고 처리합니다." />

      <section className="toolbar-panel applications-toolbar">
        <SearchInput value={query} onChange={setQuery} placeholder="이름, 이메일, 학과 검색" />
        <div className="view-toggle" role="group" aria-label="보기 방식">
          <button type="button" className={view === "board" ? "active" : ""} onClick={() => setView("board")}>Board</button>
          <button type="button" className={view === "list" ? "active" : ""} onClick={() => setView("list")}>List</button>
        </div>
        <Button variant="secondary" onClick={() => actions.refreshResource("applications")}>새로고침</Button>
      </section>

      {resourceState?.applications?.loading ? <EmptyState title="지원서를 불러오는 중입니다." /> : null}
      {resourceState?.applications?.error ? <EmptyState title="지원서를 불러오지 못했습니다." description={resourceState.applications.error} /> : null}

      {!resourceState?.applications?.loading && !resourceState?.applications?.error && view === "board" ? (
        <section className="applications-board" aria-label="지원 상태 보드">
          {stages.map((stage) => {
            const items = rows.filter((item) => (item.status || "pending") === stage.id);
            return (
              <section className="board-column" key={stage.id}>
                <header>
                  <div><span className={`status-dot status-${stage.id}`} /> <strong>{stage.label}</strong></div>
                  <span>{items.length}</span>
                </header>
                <div className="board-column-body">
                  {items.map((item) => <ApplicationCard key={item.id} item={item} onDetail={openDetail} onReview={openReview} />)}
                  {!items.length ? <div className="board-empty">해당 상태의 지원서가 없습니다.</div> : null}
                </div>
              </section>
            );
          })}
        </section>
      ) : null}

      {!resourceState?.applications?.loading && !resourceState?.applications?.error && view === "list" ? (
        <section className="application-list">
          {rows.map((item) => (
            <article className="application-list-row" key={item.id}>
              <div className="application-card-head">
                <span className="application-avatar">{String(item.name || "A").slice(0, 1)}</span>
                <div><h3>{item.name}</h3><p>{item.email}</p></div>
              </div>
              <span>{item.department || "-"}</span>
              <span>{item.target_term || "-"}</span>
              <Badge value={item.status || "pending"} />
              <span>{String(item.created_at || "-").slice(0, 10)}</span>
              <div className="item-actions quiet-actions">
                <Button size="sm" variant="secondary" onClick={() => openDetail(item)}>상세</Button>
                <Button size="sm" variant="primary" onClick={() => openReview(item)}>상태 변경</Button>
              </div>
            </article>
          ))}
          {!rows.length ? <EmptyState title="조건에 맞는 지원서가 없습니다." /> : null}
        </section>
      ) : null}
    </div>
  );
}
