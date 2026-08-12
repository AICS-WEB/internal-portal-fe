import { useMemo, useState } from "react";
import { budgetApi } from "../api/budgetApi.js";
import { credentialsApi } from "../api/credentialsApi.js";
import { leaveApi } from "../api/leaveApi.js";
import { procurementApi } from "../api/procurementApi.js";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import EmptyState from "../components/EmptyState.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import SearchInput from "../components/SearchInput.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { formatCurrency, formatDate } from "../utils/format.js";
import { hasRole } from "../utils/permissions.js";

const statusFilter = [
  { value: "all", label: "전체" },
  { value: "pending", label: "대기" },
  { value: "reviewing", label: "검토" },
  { value: "accepted", label: "합격" },
  { value: "rejected", label: "반려" },
];

function ReadState({ state, emptyTitle, emptyDescription }) {
  if (state?.loading) return <EmptyState title="불러오는 중" description="API 응답을 기다리고 있습니다." />;
  if (state?.error) return <EmptyState title="조회 실패" description={state.error} />;
  return <EmptyState title={emptyTitle} description={emptyDescription} />;
}

function DirectReviewPanel({ title, description, idLabel, onSubmit, showToast, statusOptions = ["approved", "rejected"], extraStatus }) {
  const [values, setValues] = useState({ id: "", status: statusOptions[0], rejectReason: "", expenseId: "" });
  const [submitting, setSubmitting] = useState(false);

  const update = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(values);
      showToast("요청이 처리되었습니다.");
      setValues({ id: "", status: statusOptions[0], rejectReason: "", expenseId: "" });
    } catch (error) {
      showToast(error.message || "요청 처리에 실패했습니다.", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <SectionHeader title={title} description={description} />
      <form className="form-grid compact-form" onSubmit={submit} aria-busy={submitting}>
        <label className="field">
          <span>{idLabel}</span>
          <input value={values.id} onChange={(event) => update("id", event.target.value)} required />
        </label>
        <label className="field">
          <span>status</span>
          <select value={values.status} onChange={(event) => update("status", event.target.value)}>
            {[...statusOptions, ...(extraStatus || [])].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>rejectReason</span>
          <textarea rows={3} value={values.rejectReason} onChange={(event) => update("rejectReason", event.target.value)} />
        </label>
        {extraStatus ? (
          <label className="field">
            <span>expenseId</span>
            <input value={values.expenseId} onChange={(event) => update("expenseId", event.target.value)} />
          </label>
        ) : null}
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "처리 중" : "실행"}
        </Button>
      </form>
    </section>
  );
}

export function AttendanceApiPage({ data, actions }) {
  const latestRecord = data.attendanceRecords[0];

  return (
    <div className="page-stack">
      <SectionHeader title="Attendance" description="출근/퇴근 API만 제공되므로 이력 목록은 실제 데이터처럼 표시하지 않습니다." />
      <section className="summary-grid three">
        <StatCard label="출근 API" value="Connected" note="POST /api/attendance/check-in" tone="success" />
        <StatCard label="퇴근 API" value="Connected" note="POST /api/attendance/check-out" tone="success" />
        <StatCard label="출결 이력" value="미지원" note="명세에 조회 API 없음" tone="warning" />
      </section>
      <section className="panel">
        <div className="attendance-actions">
          <div className="attendance-card">
            <Badge value={latestRecord?.status || "absent"} />
            <strong>{latestRecord ? "이번 세션의 최근 출결 응답" : "아직 이번 세션 출결 요청이 없습니다."}</strong>
            <p>{latestRecord ? `출근 ${formatDate(latestRecord.check_in)} · 퇴근 ${formatDate(latestRecord.check_out)}` : "백엔드 응답만 임시 표시합니다."}</p>
          </div>
          <div className="button-row">
            <Button variant="primary" onClick={() => actions.checkAttendance("in")}>
              출근
            </Button>
            <Button variant="secondary" onClick={() => actions.checkAttendance("out")}>
              퇴근
            </Button>
          </div>
        </div>
      </section>
      <section className="record-list">
        {data.attendanceRecords.length ? (
          data.attendanceRecords.map((record) => (
            <article key={record.id || record.created_at} className="record-item">
              <div className="record-main">
                <div className="notice-meta">
                  <Badge value={record.status} />
                  <span>session response</span>
                </div>
                <strong>{record.user_name || record.user_id || "내 출결"}</strong>
                <p>
                  출근 {formatDate(record.check_in)} · 퇴근 {formatDate(record.check_out)}
                </p>
              </div>
            </article>
          ))
        ) : (
          <ReadState emptyTitle="MVP에서는 출결 이력 조회 API가 제공되지 않습니다." emptyDescription="출근/퇴근 성공 응답만 세션 동안 표시합니다." />
        )}
      </section>
    </div>
  );
}

export function LeaveApiPage({ data, currentUser, actions }) {
  return (
    <div className="page-stack">
      <SectionHeader
        title="Leave"
        description="휴가 신청 및 직접 검토 API를 연결했습니다. 목록/잔여일 조회 API는 제공되지 않습니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("leaveRequests")}>
            휴가 신청
          </Button>
        }
      />
      <section className="summary-grid three">
        <StatCard label="휴가 신청" value="Connected" note="POST /api/leave/requests" tone="success" />
        <StatCard label="휴가 검토" value={currentUser?.isPreview ? "미리보기" : hasRole(currentUser, "manager") ? "Connected" : "권한 필요"} note="PUT /api/leave/requests/:id/review" />
        <StatCard label="목록 조회" value="미지원" note="명세에 조회 API 없음" tone="warning" />
      </section>
      <section className="approval-list">
        {data.leaveRequests.length ? (
          data.leaveRequests.map((request) => (
            <article key={request.id || request.created_at} className="approval-item">
              <div className="approval-main">
                <div className="notice-meta">
                  <Badge value={request.leave_type || request.leaveType} />
                  <Badge value={request.status || "pending"} />
                  <span>session response</span>
                </div>
                <h2>{request.user_name || request.user_id || "내 휴가 신청"}</h2>
                <p>
                  {String(request.start_date || request.startDate || "").slice(0, 10)} - {String(request.end_date || request.endDate || "").slice(0, 10)}
                </p>
                <p>{request.reason || "백엔드 응답 데이터"}</p>
              </div>
            </article>
          ))
        ) : (
          <ReadState emptyTitle="휴가 목록 조회 API가 없습니다." emptyDescription="신청 성공 응답만 이번 세션 동안 표시합니다." />
        )}
      </section>
      {hasRole(currentUser, "manager") && !currentUser?.isPreview ? (
        <DirectReviewPanel
          title="MVP 직접 휴가 검토"
          description="목록 조회 API가 없어 request ID를 직접 입력합니다."
          idLabel="request ID"
          showToast={actions.showToast}
          onSubmit={(values) => leaveApi.reviewLeave(values.id, values)}
        />
      ) : null}
    </div>
  );
}

export function CalendarApiPage({ data, actions, resourceState }) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const cells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const result = [];
    for (let i = 0; i < first.getDay(); i += 1) result.push(null);
    for (let day = 1; day <= last.getDate(); day += 1) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      result.push({ day, date });
    }
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [monthCursor]);

  const eventsByDate = useMemo(
    () =>
      data.calendarEvents.reduce((acc, event) => {
        const date = event.start_datetime?.slice(0, 10);
        if (!date) return acc;
        acc[date] = acc[date] || [];
        acc[date].push(event);
        return acc;
      }, {}),
    [data.calendarEvents],
  );

  return (
    <div className="page-stack">
      <SectionHeader
        title="Lab Schedule"
        description="캘린더 CRUD와 반복 예외/분리 API를 연결했습니다."
        actions={
          <div className="button-row">
            <Button variant="primary" onClick={() => actions.openCreate("calendarEvents")}>
              일정 등록
            </Button>
            <Button variant="secondary" onClick={() => actions.refreshResource("calendarEvents")}>
              새로고침
            </Button>
          </div>
        }
      />
      <section className="toolbar-panel calendar-toolbar">
        <div className="button-row">
          <Button size="sm" variant="secondary" onClick={() => {
            const now = new Date();
            setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
          }}>Today</Button>
          <Button size="sm" variant="secondary" onClick={() => setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} aria-label="이전 달">‹</Button>
          <Button size="sm" variant="secondary" onClick={() => setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} aria-label="다음 달">›</Button>
        </div>
        <strong className="month-label">{monthCursor.getFullYear()}년 {monthCursor.getMonth() + 1}월</strong>
        <span className="view-label">Month</span>
      </section>
      <div className="schedule-layout">
        <section className="calendar-panel">
          <div className="calendar-weekdays">{["일", "월", "화", "수", "목", "금", "토"].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">
            {cells.map((cell, index) => (
              <article key={`${cell?.date || "blank"}-${index}`} className={`calendar-cell ${cell ? "" : "muted"}`}>
                {cell ? (
                  <>
                    <strong>{cell.day}</strong>
                    <div className="calendar-events">
                      {(eventsByDate[cell.date] || []).slice(0, 3).map((event) => (
                        <button key={event.id} type="button" onClick={() => actions.openEdit("calendarEvents", event)}>
                          <Badge value={event.event_type} />
                          <span>{event.title}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </article>
            ))}
          </div>
        </section>
        <section className="panel home-section">
          <SectionHeader title="Events" />
          <div className="section-list">
            {data.calendarEvents.map((event) => (
              <article key={event.id} className="section-list-item schedule-item">
                <div>
                  <div className="notice-meta">
                    <Badge value={event.event_type} />
                    <Badge value={event.scope} />
                    {event.is_recurring ? <Badge value="schedule">반복</Badge> : null}
                  </div>
                  <strong>{event.title}</strong>
                  <p>
                    {formatDate(event.start_datetime)} - {formatDate(event.end_datetime)}
                    <br />
                    {event.location || "-"}
                  </p>
                </div>
                <div className="item-actions quiet-actions">
                  <Button size="sm" variant="secondary" onClick={() => actions.openEdit("calendarEvents", event)}>
                    수정
                  </Button>
                  {event.is_recurring ? (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => actions.openCalendarException(event)}>
                        예외
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => actions.openCalendarSplit(event)}>
                        분리
                      </Button>
                    </>
                  ) : null}
                  <Button size="sm" variant="danger" onClick={() => actions.deleteItem("calendarEvents", event, "일정")}>
                    삭제
                  </Button>
                </div>
              </article>
            ))}
            {!data.calendarEvents.length ? (
              <ReadState state={resourceState?.calendarEvents} emptyTitle="일정이 없습니다." description="등록된 일정이 없습니다." />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export function NoticesApiPage({ data, actions, globalSearch, currentUser, resourceState }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const rows = useMemo(() => {
    const query = `${search} ${globalSearch}`.trim().toLowerCase();
    return data.notices
      .filter((notice) => category === "all" || notice.category === category)
      .filter((notice) => !query || `${notice.title} ${notice.author} ${notice.content || ""}`.toLowerCase().includes(query));
  }, [category, data.notices, globalSearch, search]);

  const openDetail = async (notice) => {
    try {
      const detail = await actions.api.noticesApi.getNotice(notice.id);
      actions.openDetail("공지 상세", detail);
      actions.refreshResource("notices");
    } catch (error) {
      actions.showToast(error.message || "공지 상세 조회에 실패했습니다.", "warning");
    }
  };

  return (
    <div className="page-stack">
      <SectionHeader
        title="Notices"
        description="공지 목록/상세/등록 API를 연결했습니다. 수정/삭제 API는 명세에 없어 숨겼습니다."
        actions={
          hasRole(currentUser, "manager") ? (
            <Button variant="primary" onClick={() => actions.openCreate("notices")}>
              공지 등록
            </Button>
          ) : null
        }
      />
      <section className="toolbar-panel">
        <SearchInput value={search} onChange={setSearch} placeholder="제목, 작성자, 내용 검색" />
        <FilterTabs
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "전체" },
            { value: "general", label: "일반" },
            { value: "important", label: "중요" },
            { value: "account_info", label: "계정" },
            { value: "schedule", label: "일정" },
          ]}
        />
      </section>
      <section className="notice-list" aria-label="공지사항 목록">
        {rows.map((notice) => (
          <article key={notice.id} className="notice-item">
            <div className="notice-main">
              <div className="notice-meta">
                <Badge value={notice.category} />
                {notice.is_pinned ? <Badge value="important">Pinned</Badge> : null}
                <span>{String(notice.created_at).slice(0, 10)}</span>
                <span>{notice.author}</span>
                <span>조회 {notice.views}</span>
              </div>
              <h2>{notice.title}</h2>
              <p>{notice.content || `첨부 ${notice.attachment_count || 0}개`}</p>
            </div>
            <div className="item-actions quiet-actions">
              <Button size="sm" variant="secondary" onClick={() => openDetail(notice)}>
                상세 보기
              </Button>
            </div>
          </article>
        ))}
        {!rows.length ? <ReadState state={resourceState?.notices} emptyTitle="공지사항이 없습니다." /> : null}
      </section>
    </div>
  );
}

export function PublicationsApiPage({ data, actions, resourceState }) {
  const [status, setStatus] = useState("all");
  const rows = data.publications.filter((item) => status === "all" || item.status === status);

  const openDetail = async (item) => {
    try {
      const detail = await actions.api.publicationsApi.getPublication(item.id);
      actions.openDetail("논문 상세", detail);
    } catch (error) {
      actions.showToast(error.message || "논문 상세 조회에 실패했습니다.", "warning");
    }
  };

  return (
    <div className="page-stack">
      <SectionHeader
        title="Publications"
        description="논문 목록/상세/등록/수정/삭제 API를 연결했습니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("publications")}>
            논문 등록
          </Button>
        }
      />
      <section className="toolbar-panel">
        <FilterTabs
          options={[
            { value: "all", label: "전체" },
            { value: "writing", label: "작성 중" },
            { value: "submitted", label: "제출" },
            { value: "under_review", label: "심사 중" },
            { value: "accepted", label: "채택" },
            { value: "published", label: "출판" },
          ]}
          value={status}
          onChange={setStatus}
        />
      </section>
      <section className="citation-list">
        {rows.map((item) => (
          <article key={item.id} className="citation-item">
            <div className="citation-main">
              <h2>{item.title}</h2>
              <p className="authors">{item.authors_text}</p>
              <p>
                <strong>{item.venue || "-"}</strong>, {item.year}
                {item.published_date ? ` · ${String(item.published_date).slice(0, 10)}` : ""}
              </p>
              <div className="notice-meta">
                <Badge value={item.pub_type} />
                <Badge value={item.status} />
                <Badge value={item.is_public ? "public" : "private"} />
              </div>
            </div>
            <div className="item-actions quiet-actions">
              <Button size="sm" variant="secondary" onClick={() => openDetail(item)}>
                상세
              </Button>
              {item.doi ? (
                <Button size="sm" variant="secondary" onClick={() => actions.copyText(item.doi, "DOI가 복사되었습니다.")}>
                  DOI
                </Button>
              ) : null}
              <Button size="sm" variant="secondary" onClick={() => actions.openEdit("publications", item)}>
                수정
              </Button>
              <Button size="sm" variant="danger" onClick={() => actions.deleteItem("publications", item, "논문")}>
                삭제
              </Button>
            </div>
          </article>
        ))}
        {!rows.length ? <ReadState state={resourceState?.publications} emptyTitle="논문 데이터가 없습니다." /> : null}
      </section>
    </div>
  );
}

export function FilesApiPage({ data, actions, resourceState }) {
  const [category, setCategory] = useState("all");
  const rows = data.sharedFiles.filter((file) => category === "all" || file.category === category);

  return (
    <div className="page-stack">
      <SectionHeader
        title="Files"
        description="실제 파일 업로드가 아닌 Drive URL 기반 파일 메타데이터 API를 연결했습니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("sharedFiles")}>
            파일 등록
          </Button>
        }
      />
      <section className="toolbar-panel">
        <FilterTabs
          options={[
            { value: "all", label: "전체" },
            { value: "paper", label: "논문" },
            { value: "presentation", label: "발표" },
            { value: "template", label: "템플릿" },
            { value: "software", label: "소프트웨어" },
            { value: "other", label: "기타" },
          ]}
          value={category}
          onChange={setCategory}
        />
      </section>
      <section className="document-list">
        {rows.map((file) => (
          <article key={file.id} className="document-item">
            <div className="document-main">
              <div className="notice-meta">
                <Badge value={file.category} />
                <Badge value={file.min_role} />
                <span>{String(file.created_at || "").slice(0, 10)}</span>
              </div>
              <h2>{file.title}</h2>
              <p>{file.description}</p>
              <span className="filename">{file.filename}</span>
            </div>
            <div className="document-stats">
              <span>Version {file.version || 1}</span>
              <span>{file.download_count || 0} downloads</span>
            </div>
            <div className="item-actions quiet-actions">
              <Button size="sm" variant="secondary" onClick={() => actions.downloadFile(file)}>
                다운로드
              </Button>
              <Button size="sm" variant="secondary" onClick={() => actions.openEdit("sharedFiles", file)}>
                수정
              </Button>
              <Button size="sm" variant="danger" onClick={() => actions.deleteItem("sharedFiles", file, "공용 파일")}>
                삭제
              </Button>
            </div>
          </article>
        ))}
        {!rows.length ? <ReadState state={resourceState?.sharedFiles} emptyTitle="파일 데이터가 없습니다." /> : null}
      </section>
    </div>
  );
}

export function PurchasesApiPage({ data, currentUser, actions }) {
  return (
    <div className="page-stack">
      <SectionHeader
        title="Purchases"
        description="구매 신청/검토/상태 전이 API를 연결했습니다. 목록 조회 API는 제공되지 않습니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("purchaseRequests")}>
            구매 신청
          </Button>
        }
      />
      <section className="summary-grid three">
        <StatCard label="구매 신청" value="Connected" note="POST /api/procurement/requests" tone="success" />
        <StatCard label="구매 처리" value={currentUser?.isPreview ? "미리보기" : hasRole(currentUser, "manager") ? "Connected" : "권한 필요"} note="review/status" />
        <StatCard label="목록 조회" value="미지원" note="명세에 조회 API 없음" tone="warning" />
      </section>
      <section className="approval-list">
        {data.purchaseRequests.length ? (
          data.purchaseRequests.map((item) => (
            <article key={item.id || item.created_at} className="approval-item">
              <div className="approval-main">
                <div className="notice-meta">
                  <Badge value={item.status || "pending"} />
                  <span>session response</span>
                </div>
                <h2>{item.item_name}</h2>
                <p>
                  {item.quantity}개 · {formatCurrency(item.estimated_price)}
                </p>
                <p>{item.reason}</p>
              </div>
            </article>
          ))
        ) : (
          <ReadState emptyTitle="구매 목록 조회 API가 없습니다." emptyDescription="신청 성공 응답만 이번 세션 동안 표시합니다." />
        )}
      </section>
      {hasRole(currentUser, "manager") && !currentUser?.isPreview ? (
        <>
          <DirectReviewPanel
            title="MVP 직접 구매 검토"
            description="목록 조회 API가 없어 request ID를 직접 입력합니다."
            idLabel="request ID"
            showToast={actions.showToast}
            onSubmit={(values) => procurementApi.reviewProcurement(values.id, values)}
          />
          <DirectReviewPanel
            title="MVP 직접 상태 전이"
            description="approved → purchased → delivered 흐름만 허용됩니다."
            idLabel="request ID"
            statusOptions={["purchased", "delivered"]}
            extraStatus={[]}
            showToast={actions.showToast}
            onSubmit={(values) => procurementApi.updateStatus(values.id, values)}
          />
        </>
      ) : null}
    </div>
  );
}

export function BudgetApiPage({ data, currentUser, actions }) {
  const columns = [
    { key: "item_name", header: "지출 항목" },
    { key: "category", header: "분류", render: (expense) => <Badge value={expense.category} /> },
    { key: "amount", header: "금액", render: (expense) => formatCurrency(expense.amount) },
    { key: "date", header: "일자", render: (expense) => String(expense.date || "").slice(0, 10) },
    { key: "status", header: "상태", render: (expense) => <Badge value={expense.status} /> },
  ];

  return (
    <div className="page-stack">
      <SectionHeader
        title="Budget"
        description="지출 신청/검토 API만 연결했습니다. 예산 및 지출 목록 조회 API는 제공되지 않습니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("expenses")}>
            지출 신청
          </Button>
        }
      />
      <section className="summary-grid three">
        <StatCard label="지출 신청" value="Connected" note="POST /api/budget/expenses" tone="success" />
        <StatCard label="지출 검토" value={currentUser?.isPreview ? "미리보기" : hasRole(currentUser, "manager") ? "Connected" : "권한 필요"} note="PUT /api/budget/expenses/:id/review" />
        <StatCard label="예산 목록" value="미지원" note="budgetId 직접 입력" tone="warning" />
      </section>
      {data.expenses.length ? <DataTable columns={columns} rows={data.expenses} /> : <ReadState emptyTitle="지출 목록 조회 API가 없습니다." emptyDescription="신청 성공 응답만 이번 세션 동안 표시합니다." />}
      {hasRole(currentUser, "manager") && !currentUser?.isPreview ? (
        <DirectReviewPanel
          title="MVP 직접 지출 검토"
          description="목록 조회 API가 없어 expense ID를 직접 입력합니다."
          idLabel="expense ID"
          showToast={actions.showToast}
          onSubmit={(values) => budgetApi.reviewExpense(values.id, values)}
        />
      ) : null}
    </div>
  );
}

export function CredentialsApiPage({ data, actions, resourceState }) {
  const [revealed, setRevealed] = useState({});

  const reveal = async (credential) => {
    try {
      const data = await credentialsApi.revealPassword(credential.id);
      setRevealed((current) => ({ ...current, [credential.id]: data.password }));
      window.setTimeout(() => {
        setRevealed((current) => {
          const next = { ...current };
          delete next[credential.id];
          return next;
        });
      }, 30000);
      actions.showToast("비밀번호가 30초 동안 표시됩니다.");
      return data.password;
    } catch (error) {
      actions.showToast(error.message || "비밀번호 열람에 실패했습니다.", "warning");
      return "";
    }
  };

  const copyPassword = async (credential) => {
    const password = revealed[credential.id] || (await reveal(credential));
    if (!password) return;
    try {
      await credentialsApi.logCopy(credential.id);
      await actions.copyText(password, "접근 로그를 기록하고 비밀번호를 복사했습니다.");
    } catch (error) {
      actions.showToast(error.message || "복사 로그 기록에 실패했습니다.", "warning");
    }
  };

  const columns = [
    {
      key: "title",
      header: "계정",
      render: (credential) => (
        <div className="cell-main">
          <strong>{credential.title}</strong>
          <span>{credential.url || "-"}</span>
        </div>
      ),
    },
    { key: "category", header: "분류", render: (credential) => <Badge value={credential.category} /> },
    { key: "username", header: "아이디" },
    { key: "password", header: "비밀번호", render: (credential) => revealed[credential.id] || "••••••••••••" },
    { key: "min_role", header: "권한", render: (credential) => <Badge value={credential.min_role} /> },
    {
      key: "actions",
      header: "작업",
      render: (credential) => (
        <div className="table-actions">
          <Button size="sm" variant="secondary" onClick={() => reveal(credential)}>
            보기
          </Button>
          <Button size="sm" variant="secondary" onClick={() => copyPassword(credential)}>
            복사
          </Button>
          <Button size="sm" variant="secondary" onClick={() => actions.openEdit("sharedCredentials", credential)}>
            수정
          </Button>
          <Button size="sm" variant="danger" onClick={() => actions.deleteItem("sharedCredentials", credential, "공용 계정")}>
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader
        title="Credentials"
        description="목록에는 비밀번호를 노출하지 않고 reveal/copy API로만 접근합니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("sharedCredentials")}>
            등록
          </Button>
        }
      />
      {data.sharedCredentials.length ? <DataTable columns={columns} rows={data.sharedCredentials} /> : <ReadState state={resourceState?.sharedCredentials} emptyTitle="공용 계정 데이터가 없습니다." />}
    </div>
  );
}

export function AdminApiPage({ data, currentUser, actions, resourceState }) {
  const [status, setStatus] = useState("all");
  const rows = data.applications.filter((item) => status === "all" || item.status === status);

  const openApplication = async (item) => {
    try {
      const detail = await actions.api.applicationsApi.getApplication(item.id);
      actions.openDetail("지원서 상세", detail);
      actions.refreshResource("applications");
    } catch (error) {
      actions.showToast(error.message || "지원서 상세 조회에 실패했습니다.", "warning");
    }
  };

  const openReview = (item) => {
    actions.openForm({
      title: "지원서 상태 변경",
      fields: [
        { name: "status", label: "status", type: "select", options: ["pending", "reviewing", "accepted", "rejected"] },
        { name: "internalMemo", label: "internalMemo", type: "textarea" },
      ],
      initialValues: { status: item.status, internalMemo: item.internal_memo || "" },
      submitLabel: "저장",
      successMessage: "지원서가 업데이트되었습니다.",
      onSubmit: async (values) => {
        await actions.api.applicationsApi.updateApplication(item.id, values);
        await actions.refreshResource("applications");
      },
    });
  };

  if (!hasRole(currentUser, "manager")) {
    return <ReadState emptyTitle="권한이 없습니다." emptyDescription="관리자 기능은 manager 이상만 접근할 수 있습니다." />;
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Admin"
        description="실제 관리자 지원서 API와 admin-dashboard API를 연결했습니다."
        actions={<Button variant="primary" onClick={actions.openNotificationSend}>알림 전송</Button>}
      />
      <section className="admin-overview">
        <div><span>관리 데이터</span><strong>{data.adminDashboard ? "연결됨" : "응답 없음"}</strong><small>{resourceState?.adminDashboard?.error || "관리자 요약 응답"}</small></div>
        <div><span>지원서</span><strong>{data.applications.length}건</strong><small>실제 조회된 지원서</small></div>
        <div><span>사용자 관리</span><strong>미지원</strong><small>명세에 사용자 목록·권한 변경 API가 없습니다.</small></div>
      </section>
      <section className="toolbar-panel">
        <FilterTabs options={statusFilter} value={status} onChange={setStatus} />
        <Button variant="secondary" onClick={() => actions.refreshResource("applications")}>
          새로고침
        </Button>
      </section>
      <section className="approval-list">
        {rows.map((item) => (
          <article key={item.id} className="approval-item">
            <div className="approval-main">
              <div className="notice-meta">
                <Badge value={item.status} />
                {!item.is_read ? <Badge value="important">Unread</Badge> : null}
                <span>{String(item.created_at || "").slice(0, 10)}</span>
              </div>
              <h2>{item.name}</h2>
              <p>{item.email}</p>
              <p>{item.target_term} · {item.interest_area || "-"}</p>
            </div>
            <div className="item-actions quiet-actions">
              <Button size="sm" variant="secondary" onClick={() => openApplication(item)}>
                상세
              </Button>
              <Button size="sm" variant="secondary" onClick={() => openReview(item)}>
                상태/메모
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  actions.openForm({
                    title: "지원서 삭제 확인",
                    fields: [{ name: "confirm", label: "delete 입력", type: "text", required: true }],
                    initialValues: {},
                    submitLabel: "삭제",
                    successMessage: "지원서가 삭제되었습니다.",
                    onSubmit: async () => {
                      await actions.api.applicationsApi.deleteApplication(item.id);
                      await actions.refreshResource("applications");
                    },
                  })
                }
              >
                삭제
              </Button>
            </div>
          </article>
        ))}
        {!rows.length ? <ReadState state={resourceState?.applications} emptyTitle="지원서 데이터가 없습니다." /> : null}
      </section>
    </div>
  );
}

export function MyApiPage({ currentUser, actions }) {
  const fields = [
    "id",
    "name",
    "email",
    "role",
    "account_status",
    "student_id",
    "department",
    "program",
    "enrollment_year",
    "research_topic",
    "profile_image",
    "phone",
    "bio",
    "github_url",
    "linkedin_url",
    "is_public_profile",
  ].filter((key) => currentUser?.[key] !== undefined && currentUser?.[key] !== null && currentUser?.[key] !== "");

  return (
    <div className="page-stack">
      <SectionHeader title="My Page" description="/api/users/me와 로그인 응답에 실제 포함된 필드만 표시합니다." />
      <section className="profile-layout">
        <article className="profile-card">
          <div className="profile-avatar">{String(currentUser?.name || "U").slice(0, 1)}</div>
          <h2>{currentUser?.name || "사용자"}</h2>
          <p>{currentUser?.email || "이메일 응답 없음"}</p>
          <div className="inline-gap center">
            <Badge value={currentUser?.role} />
            <Badge value={currentUser?.account_status} />
          </div>
          <div className="button-row center">
            <Button variant="secondary" disabled>
              프로필 수정 MVP 미지원
            </Button>
            <Button variant="primary" onClick={actions.requestPasswordReset}>
              비밀번호 재설정 요청
            </Button>
          </div>
        </article>
        <article className="panel">
          <SectionHeader title="프로필 정보" />
          <dl className="detail-grid">
            {fields.map((key) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{String(currentUser[key])}</dd>
              </div>
            ))}
          </dl>
          <p className="muted-note">현재 백엔드 /api/users/me는 토큰 기반 최소 사용자 정보만 반환합니다.</p>
        </article>
      </section>
    </div>
  );
}

export function ProjectsApiPage() {
  return (
    <div className="page-stack">
      <SectionHeader title="Projects" description="API 명세에 연구과제 CRUD/조회 엔드포인트가 없어 이번 MVP에서는 연결하지 않습니다." />
      <ReadState emptyTitle="Projects API가 명세에 없습니다." emptyDescription="가짜 과제 목록을 실제 데이터처럼 표시하지 않습니다." />
    </div>
  );
}
