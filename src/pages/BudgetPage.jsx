import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { formatCurrency } from "../utils/format.js";

export default function BudgetPage({ data, actions }) {
  const columns = [
    {
      key: "item_name",
      header: "지출 항목",
      render: (expense) => (
        <div className="cell-main">
          <strong>{expense.item_name}</strong>
          <span>{data.budgets.find((budget) => budget.id === expense.budget_id)?.name || expense.budget_id}</span>
        </div>
      ),
    },
    { key: "category", header: "분류", render: (expense) => <Badge value={expense.category} /> },
    { key: "amount", header: "금액", render: (expense) => formatCurrency(expense.amount) },
    { key: "date", header: "일자" },
    { key: "status", header: "상태", render: (expense) => <Badge value={expense.status} /> },
    {
      key: "actions",
      header: "작업",
      render: (expense) => (
        <div className="table-actions">
          <Button size="sm" variant="secondary" onClick={() => actions.updateItem("expenses", expense.id, { status: "approved" })}>
            지출 승인
          </Button>
          <Button size="sm" variant="secondary" onClick={() => actions.updateItem("expenses", expense.id, { status: "rejected" })}>
            지출 반려
          </Button>
          <Button size="sm" variant="secondary" onClick={() => actions.showToast("영수증 첨부 상태가 갱신되었습니다.")}>
            영수증 첨부
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader
        title="Budget"
        description="예산 사용 현황과 지출 승인 상태를 확인합니다."
        actions={
          <div className="button-row">
            <Button variant="primary" onClick={() => actions.openCreate("budgets")}>
              예산 등록
            </Button>
            <Button variant="secondary" onClick={() => actions.openCreate("expenses")}>
              지출 등록
            </Button>
          </div>
        }
      />

      <section className="budget-grid">
        {data.budgets.map((budget) => {
          const percent = Math.min(100, Math.round((budget.used_amount / budget.total_budget) * 100));
          return (
            <article key={budget.id} className="budget-card">
              <div className="card-topline">
                <Badge value={budget.fund_type} />
                <Badge value={budget.status} />
              </div>
              <h2>{budget.name}</h2>
              <div className="budget-numbers">
                <strong>{formatCurrency(budget.total_budget)}</strong>
                <span>사용 {formatCurrency(budget.used_amount)}</span>
                <span>잔액 {formatCurrency(budget.total_budget - budget.used_amount)}</span>
              </div>
              <div className="progress-bar" aria-label={`사용률 ${percent}%`}>
                <span style={{ width: `${percent}%` }} />
              </div>
              <p>
                {budget.start_date} - {budget.end_date}
              </p>
            </article>
          );
        })}
      </section>

      <DataTable columns={columns} rows={data.expenses} />
    </div>
  );
}
