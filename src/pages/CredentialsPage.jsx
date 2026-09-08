import { useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function CredentialsPage({ data, actions }) {
  const [revealed, setRevealed] = useState({});

  const togglePassword = async (credential) => {
    if (revealed[credential.id]) {
      setRevealed((current) => ({ ...current, [credential.id]: null }));
      return;
    }
    const password = await actions.getCredentialPassword(credential);
    if (!password) return;
    setRevealed((current) => ({ ...current, [credential.id]: password }));
    window.setTimeout(() => setRevealed((current) => ({ ...current, [credential.id]: null })), 60_000);
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
            {actions.isAdmin ? <Button size="sm" variant="secondary" onClick={() => actions.openEdit("sharedCredentials", credential)}>
              수정
            </Button> : null}
            {actions.isAdmin ? <Button size="sm" variant="danger" onClick={() => actions.deleteItem("sharedCredentials", credential.id, "공용 계정")}>
              삭제
            </Button> : null}
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
        actions={actions.isAdmin ? (
          <Button variant="primary" onClick={() => actions.openCreate("sharedCredentials")}>
            등록
          </Button>
        ) : null}
      />

      <DataTable columns={columns} rows={data.sharedCredentials} />
    </div>
  );
}
