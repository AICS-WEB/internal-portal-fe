import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function AdminPage({ data, actions }) {
  const pendingUsers = data.users.filter((user) => user.account_status === "pending");

  const pendingColumns = [
    { key: "name", header: "이름" },
    { key: "email", header: "이메일" },
    { key: "program", header: "과정" },
    { key: "research_topic", header: "연구 주제" },
    {
      key: "actions",
      header: "작업",
      render: (user) => (
        <div className="table-actions">
          <Button size="sm" variant="secondary" onClick={() => actions.updateItem("users", user.id, { account_status: "approved" })}>
            가입 승인
          </Button>
          <Button size="sm" variant="danger" onClick={() => actions.updateItem("users", user.id, { account_status: "rejected" })}>
            가입 반려
          </Button>
        </div>
      ),
    },
  ];

  const userColumns = [
    {
      key: "name",
      header: "사용자",
      render: (user) => (
        <div className="cell-main">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "role",
      render: (user) => (
        <select className="select-control compact" value={user.role} onChange={(event) => actions.updateItem("users", user.id, { role: event.target.value })}>
          <option value="member">member</option>
          <option value="manager">manager</option>
          <option value="admin">admin</option>
        </select>
      ),
    },
    {
      key: "account_status",
      header: "account_status",
      render: (user) => (
        <select className="select-control compact" value={user.account_status} onChange={(event) => actions.updateItem("users", user.id, { account_status: event.target.value })}>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
          <option value="deactivated">deactivated</option>
        </select>
      ),
    },
    { key: "program", header: "과정" },
    { key: "account_badge", header: "상태", render: (user) => <Badge value={user.account_status} /> },
    {
      key: "actions",
      header: "작업",
      render: (user) => (
        <div className="table-actions">
          <Button size="sm" variant="secondary" onClick={() => actions.showToast("권한 변경 내용이 저장되었습니다.")}>
            권한 변경
          </Button>
          <Button size="sm" variant="danger" onClick={() => actions.updateItem("users", user.id, { account_status: "deactivated" })}>
            계정 비활성화
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader title="Admin" description="가입 승인과 사용자 권한 변경을 중심으로 관리합니다." />

      <section className="panel">
        <SectionHeader title="사용자 승인 대기" />
        <DataTable columns={pendingColumns} rows={pendingUsers} emptyTitle="승인 대기 중인 사용자가 없습니다." />
      </section>

      <section className="panel">
        <SectionHeader title="전체 사용자 목록" />
        <DataTable columns={userColumns} rows={data.users} />
      </section>
    </div>
  );
}
