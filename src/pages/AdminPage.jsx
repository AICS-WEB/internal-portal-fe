import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { formatDateTime } from "../utils/format.js";

export default function AdminPage({ data, currentUser, actions }) {
  const [drafts, setDrafts] = useState({});
  useEffect(() => setDrafts({}), [data.users]);
  const draftValue = (user, key) => drafts[user.id]?.[key] ?? user[key];
  const setDraft = (user, key, value) => setDrafts((current) => ({
    ...current,
    [user.id]: { ...(current[user.id] || {}), [key]: value },
  }));
  const saveUserChange = (user, key, label) => {
    const value = draftValue(user, key);
    if (value === user[key]) return;
    actions.confirmUpdate("users", user, { [key]: value }, label);
  };
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
        <div className="table-actions">
        <select
          className="select-control"
          value={draftValue(user, "role")}
          disabled={Number(user.id) === Number(currentUser.id)}
          onChange={(event) => setDraft(user, "role", event.target.value)}
        >
          <option value="member">일반 구성원</option>
          <option value="manager">관리자</option>
          <option value="admin">최고 관리자</option>
        </select>
        <Button size="sm" variant="secondary" disabled={Number(user.id) === Number(currentUser.id) || draftValue(user, "role") === user.role} onClick={() => saveUserChange(user, "role", "사용자 역할")}>역할 저장</Button>
        </div>
      ),
    },
    {
      key: "account_status",
      header: "계정 상태",
      render: (user) => (
        <div className="table-actions">
        <select
          className="select-control"
          value={draftValue(user, "account_status")}
          disabled={Number(user.id) === Number(currentUser.id)}
          onChange={(event) => setDraft(user, "account_status", event.target.value)}
        >
          <option value="pending">승인 대기</option>
          <option value="approved">활성</option>
          <option value="rejected">가입 반려</option>
          <option value="deactivated">비활성</option>
        </select>
        <Button size="sm" variant="secondary" disabled={Number(user.id) === Number(currentUser.id) || draftValue(user, "account_status") === user.account_status} onClick={() => saveUserChange(user, "account_status", "계정 상태")}>상태 저장</Button>
        </div>
      ),
    },
    { key: "last_login_at", header: "최근 로그인", render: (user) => formatDateTime(user.last_login_at) },
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
