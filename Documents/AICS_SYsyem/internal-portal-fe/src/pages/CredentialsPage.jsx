import { useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { hasRole } from "../utils/permissions.js";

export default function CredentialsPage({ data, currentUser, actions }) {
  const [revealed, setRevealed] = useState({});
  const visibleCredentials = data.sharedCredentials.filter((credential) => actions.canAccess(credential));

  const togglePassword = async (credential) => {
    if (revealed[credential.id]) {
      setRevealed((current) => ({ ...current, [credential.id]: null }));
      return;
    }
    try {
      const password = await actions.getCredentialPassword(credential);
      if (password) setRevealed((current) => ({ ...current, [credential.id]: password }));
    } catch {
      return;
    }
  };

  const columns = [
    {
      key: "title",
      header: "계정",
      render: (credential) => (
        <div className="cell-main">
          <strong>{credential.title}</strong>
          <span>{credential.url}</span>
        </div>
      ),
    },
    { key: "category", header: "분류", render: (credential) => <Badge value={credential.category} /> },
    { key: "username", header: "아이디" },
    {
      key: "password",
      header: "비밀번호",
      render: (credential) => revealed[credential.id] || "••••••••••••",
    },
    { key: "min_role", header: "권한", render: (credential) => <Badge value={credential.min_role} /> },
    {
      key: "actions",
      header: "작업",
      render: (credential) => {
        const allowed = actions.canAccess(credential);
        const canManage = hasRole(currentUser, "manager");
        return (
          <div className="table-actions">
            <Button
              size="sm"
              variant="secondary"
              disabled={!allowed}
              onClick={() => togglePassword(credential)}
            >
              {revealed[credential.id] ? "비밀번호 숨기기" : "비밀번호 보기"}
            </Button>
            <Button size="sm" variant="secondary" disabled={!allowed} onClick={() => actions.copyCredential(credential)}>
              복사
            </Button>
            {canManage ? <>
              <Button size="sm" variant="secondary" onClick={() => actions.openEdit("sharedCredentials", credential)}>수정</Button>
              <Button size="sm" variant="danger" onClick={() => actions.deleteItem("sharedCredentials", credential.id, "공용 계정")}>삭제</Button>
            </> : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader
        title="공용 계정"
        description="공용 계정과 비밀번호를 권한 기반으로 관리합니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("sharedCredentials")}>
            등록
          </Button>
        }
      />

      <DataTable columns={columns} rows={visibleCredentials} />
    </div>
  );
}
