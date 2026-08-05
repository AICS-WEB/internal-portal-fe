import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function AdminPage({ data, actions }) {
  const pendingUsers = data.users.filter((user) => user.account_status === "pending");
  const columns = [
    {
      key: "name",
      header: "신청자",
      render: (user) => (
        <div className="cell-main">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
      ),
    },
    { key: "student_id", header: "학번" },
    { key: "department", header: "학과" },
    { key: "program", header: "과정" },
    { key: "enrollment_year", header: "입학년도" },
    {
      key: "actions",
      header: "작업",
      render: (user) => (
        <div className="table-actions">
          <Button size="sm" variant="secondary" onClick={() => actions.updateItem("users", user.id, { account_status: "approved" })}>가입 승인</Button>
          <Button size="sm" variant="danger" onClick={() => actions.updateItem("users", user.id, { account_status: "rejected" })}>가입 반려</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader title="Admin" description="가입 승인 대기자를 조회하고 승인·반려합니다." />
      <section className="panel">
        <SectionHeader title="사용자 승인 대기" />
        <DataTable columns={columns} rows={pendingUsers} emptyTitle="승인 대기 중인 사용자가 없습니다." />
      </section>
      <section className="panel">
        <EmptyState title="전체 사용자 관리 API 연결 대기 중" description="역할 변경, 계정 비활성화 및 전체 사용자 목록 API는 아직 제공되지 않습니다." />
      </section>
    </div>
  );
}
