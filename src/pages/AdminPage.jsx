import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function AdminPage({ data, actions }) {
  const pendingUsers = data.users.filter((user) => user.account_status === "pending");

  return (
    <div className="page-stack">
      <SectionHeader title="Admin" description="Review Queue와 Members Directory 중심으로 사용자 접근 권한을 관리합니다." />

      <section className="panel home-section">
        <SectionHeader title="Review Queue" description="새 구성원 가입 요청을 검토합니다." />
        <div className="approval-list compact-list">
          {pendingUsers.length ? (
            pendingUsers.map((user) => (
              <article key={user.id} className="approval-item">
                <div className="approval-main">
                  <div className="notice-meta">
                    <Badge value={user.account_status} />
                    <span>{user.program}</span>
                  </div>
                  <h2>{user.name}</h2>
                  <p>{user.email}</p>
                  <p>{user.research_topic}</p>
                </div>
                <div className="item-actions quiet-actions">
                  <Button size="sm" variant="secondary" onClick={() => actions.updateItem("users", user.id, { account_status: "approved" })}>
                    가입 승인
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => actions.updateItem("users", user.id, { account_status: "rejected" })}>
                    가입 반려
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">승인 대기 중인 사용자가 없습니다.</div>
          )}
        </div>
      </section>

      <section className="panel home-section">
        <SectionHeader title="Members Directory" description="구성원 role과 account status를 관리합니다." />
        <div className="member-directory">
          {data.users.map((user) => (
            <article key={user.id} className="member-row">
              <div className="member-identity">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <small>{user.program} · {user.research_topic || "Research topic not set"}</small>
              </div>
              <div className="member-controls">
                <select className="select-control compact" value={user.role} onChange={(event) => actions.updateItem("users", user.id, { role: event.target.value })}>
                  <option value="member">member</option>
                  <option value="manager">manager</option>
                  <option value="admin">admin</option>
                </select>
                <select className="select-control compact" value={user.account_status} onChange={(event) => actions.updateItem("users", user.id, { account_status: event.target.value })}>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                  <option value="deactivated">deactivated</option>
                </select>
                <Badge value={user.account_status} />
              </div>
              <div className="item-actions quiet-actions">
                <Button size="sm" variant="secondary" onClick={() => actions.showToast("권한 변경 내용이 저장되었습니다.")}>
                  권한 변경
                </Button>
                <Button size="sm" variant="danger" onClick={() => actions.updateItem("users", user.id, { account_status: "deactivated" })}>
                  계정 비활성화
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
