import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StatCard from "../components/StatCard.jsx";

const statusOptions = [
  { value: "all", label: "전체" },
  { value: "pending", label: "대기" },
  { value: "approved", label: "승인" },
  { value: "rejected", label: "반려" },
];

export default function LeavePage({ data, currentUser, actions }) {
  const [status, setStatus] = useState("all");
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
      render: (request) => (
        <div className="table-actions">
          <Button size="sm" variant="secondary" onClick={() => actions.openEdit("leaveRequests", request)}>
            신청 수정
          </Button>
          <Button size="sm" variant="secondary" onClick={() => actions.updateItem("leaveRequests", request.id, { status: "approved" })}>
            승인
          </Button>
          <Button size="sm" variant="secondary" onClick={() => actions.updateItem("leaveRequests", request.id, { status: "rejected" })}>
            반려
          </Button>
          <Button size="sm" variant="danger" onClick={() => actions.deleteItem("leaveRequests", request.id, "휴가 신청")}>
            신청 취소
          </Button>
        </div>
      ),
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

      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
