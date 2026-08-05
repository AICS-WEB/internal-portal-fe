import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { hasRole } from "../utils/permissions.js";

const statusOptions = [
  { value: "all", label: "전체" },
  { value: "pending", label: "대기" },
  { value: "approved", label: "승인" },
  { value: "rejected", label: "반려" },
];

export default function LeavePage({ data, currentUser, actions }) {
  const [status, setStatus] = useState("all");
  const [balanceUserId, setBalanceUserId] = useState("");
  const [balanceYear, setBalanceYear] = useState(String(new Date().getFullYear()));
  const canReview = hasRole(currentUser, "manager");
  const balance = data.leaveBalances.find((item) => item.user_id === currentUser.id) || data.leaveBalances[0];

  const rows = useMemo(() => {
    return data.leaveRequests.filter((request) => status === "all" || request.status === status);
  }, [data.leaveRequests, status]);

  const columns = [
    { key: "user_name", header: "신청자" },
    { key: "leave_type", header: "유형", render: (request) => <Badge value={request.leave_type} /> },
    { key: "period", header: "기간", render: (request) => `${request.start_date} - ${request.end_date}` },
    { key: "half_period", header: "반차" },
    { key: "reason", header: "사유" },
    { key: "status", header: "상태", render: (request) => <Badge value={request.status} /> },
    {
      key: "actions",
      header: "작업",
      render: (request) => {
        const isOwner = String(request.user_id) === String(currentUser.id);
        const canEdit = isOwner && request.status === "pending";
        const canDelete = canReview || canEdit;
        return (
          <div className="table-actions">
            {canEdit ? (
              <Button size="sm" variant="secondary" onClick={() => actions.openEdit("leaveRequests", request)}>신청 수정</Button>
            ) : null}
            {canReview && request.status === "pending" ? (
              <>
              <Button size="sm" variant="secondary" onClick={() => actions.updateItem("leaveRequests", request.id, { status: "approved" })}>
                승인
              </Button>
              <Button size="sm" variant="secondary" onClick={() => actions.updateItem("leaveRequests", request.id, { status: "rejected" })}>
                반려
              </Button>
              </>
            ) : null}
            {canDelete ? (
              <Button size="sm" variant="danger" onClick={() => actions.deleteItem("leaveRequests", request.id, "휴가 신청")}>신청 삭제</Button>
            ) : null}
            {!canEdit && !canReview && !canDelete ? "-" : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader
        title="Leave"
        description="휴가 잔여일과 신청 상태를 관리합니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("leaveRequests")}>
            휴가 신청
          </Button>
        }
      />

      <section className="summary-grid three">
        <StatCard label="총 휴가" value={`${balance?.total_days || 0}일`} />
        <StatCard label="사용" value={`${balance?.used_days || 0}일`} tone="warning" />
        <StatCard label="잔여" value={`${balance?.remaining_days || 0}일`} tone="success" />
      </section>

      <section className="toolbar-panel">
        <FilterTabs options={statusOptions} value={status} onChange={setStatus} />
      </section>

      {canReview ? (
        <section className="panel manager-query-panel">
          <SectionHeader
            title="구성원 휴가 잔여일 조회"
            description="사용자와 연도를 선택해 개인별 부여·사용·잔여 일수를 조회합니다."
          />
          <div className="manager-query-grid">
            <label className="field">
              <span>구성원</span>
              <select value={balanceUserId} onChange={(event) => setBalanceUserId(event.target.value)}>
                <option value="">구성원 선택</option>
                {data.users.filter((user) => user.account_status === "approved").map((user) => (
                  <option key={user.id} value={user.id}>{user.name} · {user.email}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>조회 연도</span>
              <input type="number" min="2000" max="2100" value={balanceYear} onChange={(event) => setBalanceYear(event.target.value)} />
            </label>
            <Button variant="primary" disabled>잔여일 조회</Button>
          </div>
          <p className="feature-caption">조회 결과 카드와 사용자별 잔여일 API는 다음 연동 단계에서 활성화됩니다.</p>
        </section>
      ) : null}

      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
