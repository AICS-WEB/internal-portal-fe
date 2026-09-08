import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { formatDate, formatLabel } from "../utils/format.js";

export default function AdminPage({ data, currentUser, actions }) {
  const pendingUsers = data.users.filter((user) => user.account_status === "pending");
  const pendingColumns = [
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
    { key: "program", header: "과정", render: (user) => formatLabel(user.program) },
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
    { key: "student_id", header: "학번" },
    { key: "department", header: "소속" },
    {
      key: "role",
      header: "역할",
      render: (user) => (
        <select
          className="select-control"
          value={user.role}
          disabled={Number(user.id) === Number(currentUser.id)}
          onChange={(event) => actions.updateItem("users", user.id, { role: event.target.value })}
        >
          <option value="member">일반 구성원</option>
          <option value="manager">관리자</option>
          <option value="admin">최고 관리자</option>
        </select>
      ),
    },
    {
      key: "account_status",
      header: "계정 상태",
      render: (user) => (
        <select
          className="select-control"
          value={user.account_status}
          disabled={Number(user.id) === Number(currentUser.id)}
          onChange={(event) => actions.updateItem("users", user.id, { account_status: event.target.value })}
        >
          <option value="pending">승인 대기</option>
          <option value="approved">활성</option>
          <option value="rejected">가입 반려</option>
          <option value="deactivated">비활성</option>
        </select>
      ),
    },
    { key: "last_login_at", header: "최근 로그인", render: (user) => formatDate(user.last_login_at) },
  ];

  return (
    <div className="page-stack">
      <SectionHeader title="사용자 관리" description="가입 승인, 사용자 역할과 계정 상태를 관리합니다." />
      <section className="panel">
        <SectionHeader title="사용자 승인 대기" />
        <DataTable columns={pendingColumns} rows={pendingUsers} emptyTitle="승인 대기 중인 사용자가 없습니다." />
      </section>
      <section className="panel">
        <SectionHeader title="전체 사용자 관리" description="본인의 역할과 계정 상태는 변경할 수 없습니다." />
        <DataTable columns={userColumns} rows={data.users} emptyTitle="등록된 사용자가 없습니다." />
      </section>
    </div>
  );
}
