import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { formatCurrency } from "../utils/format.js";
import { hasRole } from "../utils/permissions.js";

const statusOptions = [
  { value: "all", label: "전체" },
  { value: "pending", label: "대기" },
  { value: "approved", label: "승인" },
  { value: "rejected", label: "반려" },
  { value: "purchased", label: "구매 완료" },
  { value: "delivered", label: "입고 완료" },
];

export default function PurchasesPage({ data, currentUser, actions }) {
  const [status, setStatus] = useState("all");
  const canReview = hasRole(currentUser, "manager");

  const rows = useMemo(() => {
    return data.purchaseRequests.filter((item) => status === "all" || item.status === status);
  }, [data.purchaseRequests, status]);

  const columns = [
    {
      key: "item_name",
      header: "물품",
      render: (item) => (
        <div className="cell-main">
          <strong>{item.item_name}</strong>
          <span>{item.reason}</span>
        </div>
      ),
    },
    { key: "quantity", header: "수량" },
    { key: "estimated_price", header: "예상 금액", render: (item) => formatCurrency(item.estimated_price) },
    { key: "requester", header: "신청자" },
    { key: "status", header: "상태", render: (item) => <Badge value={item.status} /> },
    {
      key: "actions",
      header: "작업",
      render: (item) => {
        const isOwner = item.requester === currentUser.name;
        const canEdit = isOwner && item.status === "pending";
        const canDelete = canReview || canEdit;
        const hasWorkflowAction = canReview && ["pending", "approved", "purchased"].includes(item.status);
        return (
          <div className="table-actions">
            {canReview && item.status === "pending" ? (
              <>
                <Button size="sm" variant="secondary" onClick={() => actions.updateItem("purchaseRequests", item.id, { status: "approved" })}>승인</Button>
                <Button size="sm" variant="secondary" onClick={() => actions.updateItem("purchaseRequests", item.id, { status: "rejected" })}>반려</Button>
              </>
            ) : null}
            {canReview && item.status === "approved" ? (
              <Button size="sm" variant="secondary" onClick={() => actions.updateItem("purchaseRequests", item.id, { status: "purchased" })}>구매 완료 처리</Button>
            ) : null}
            {canReview && item.status === "purchased" ? (
              <Button size="sm" variant="secondary" onClick={() => actions.updateItem("purchaseRequests", item.id, { status: "delivered" })}>입고 완료 처리</Button>
            ) : null}
            {canReview && ["approved", "rejected", "delivered"].includes(item.status) ? (
              <Button size="sm" variant="secondary" onClick={() => actions.updateItem("purchaseRequests", item.id, { status: "pending" })}>재검토</Button>
            ) : null}
            {canEdit ? <Button size="sm" variant="secondary" onClick={() => actions.openEdit("purchaseRequests", item)}>수정</Button> : null}
            {canDelete ? <Button size="sm" variant="danger" onClick={() => actions.deleteItem("purchaseRequests", item.id, "구매 신청")}>삭제</Button> : null}
            {!hasWorkflowAction && !canEdit && !canDelete ? "-" : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader
        title="구매"
        description="물품 구매 요청의 승인, 구매, 입고 상태를 관리합니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("purchaseRequests")}>
            구매 신청
          </Button>
        }
      />

      <section className="toolbar-panel">
        <FilterTabs options={statusOptions} value={status} onChange={setStatus} />
      </section>

      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
