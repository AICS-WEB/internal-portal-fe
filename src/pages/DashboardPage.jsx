import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import { formatDateOnly, formatDateTime, formatLabel, formatNumber, todayISO } from "../utils/format.js";

const QUICK_ACTIONS = [
  { label: "공지 작성", resource: "notices", managerOnly: true },
  { label: "일정 등록", resource: "calendarEvents" },
  { label: "휴가 신청", resource: "leaveRequests" },
  { label: "파일 업로드", resource: "sharedFiles" },
  { label: "구매 신청", resource: "purchaseRequests" },
];

function percent(part, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

function dateValue(item) {
  return item?.requested_at || item?.created_at || item?.start_datetime || item?.start_date || "";
}

function ProgressRow({ label, value, total, tone = "blue" }) {
  const ratio = percent(value, total);
  return (
    <div className="analytics-progress-row">
      <div className="analytics-progress-label"><span>{label}</span><strong>{formatNumber(value)}</strong></div>
      <div className="analytics-progress-track" aria-label={`${label} ${ratio}%`}>
        <span className={`tone-${tone}`} style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage({ data, currentUser, actions }) {
  const today = todayISO();
  const users = data.users || [];
  const notices = data.notices || [];
  const events = data.calendarEvents || [];
  const projects = data.researchProjects || [];
  const publications = data.publications || [];
  const leaveRequests = data.leaveRequests || [];
  const purchaseRequests = data.purchaseRequests || [];
  const attendance = data.attendanceRecords || [];

  const memberCount = users.filter((user) => user.account_status === "approved").length || users.length;
  const activeProjects = projects.filter((project) => ["active", "in_progress", "ongoing"].includes(String(project.status).toLowerCase())).length;
  const publishedPapers = publications.filter((publication) => publication.status === "published").length;
  const todayAttendance = attendance.filter((record) => record.date === today);
  const presentToday = todayAttendance.filter((record) => ["present", "late"].includes(record.status)).length;
  const pendingLeave = leaveRequests.filter((request) => request.status === "pending").length;
  const approvedLeave = leaveRequests.filter((request) => request.status === "approved").length;
  const reviewingPapers = publications.filter((publication) => ["submitted", "under_review"].includes(publication.status)).length;

  const upcomingEvents = [...events]
    .filter((event) => event.start_datetime && String(event.start_datetime).slice(0, 10) >= today)
    .sort((a, b) => String(a.start_datetime).localeCompare(String(b.start_datetime)))
    .slice(0, 5);

  const recentRequests = [
    ...leaveRequests.map((item) => ({ ...item, requestType: "휴가", requestTitle: formatLabel(item.leave_type), requesterName: item.user_name })),
    ...purchaseRequests.map((item) => ({ ...item, requestType: "구매", requestTitle: item.item_name, requesterName: item.requester })),
  ].sort((a, b) => String(dateValue(b)).localeCompare(String(dateValue(a)))).slice(0, 5);

  return (
    <div className="dashboard-page">
      <section className="dashboard-intro">
        <div>
          <p className="dashboard-eyebrow">연구실 업무 공간</p>
          <h1>안녕하세요, {currentUser.name}님</h1>
          <p>오늘 연구실 현황과 진행 중인 업무를 확인하세요.</p>
        </div>
        <div className="dashboard-quick-actions">
          {QUICK_ACTIONS.filter((item) => !item.managerOnly || actions.isManager).map((item) => (
            <Button key={item.resource} size="sm" variant={item.resource === "calendarEvents" ? "primary" : "secondary"} onClick={() => actions.openCreate(item.resource)}>
              {item.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="overview-hero">
        <div className="overview-copy">
          <span className="overview-kicker">연구실 한눈에 보기</span>
          <h2>연구와 운영 현황을<br />한 화면에서 확인하세요.</h2>
          <p>현재 서버에서 불러온 구성원, 연구과제, 논문, 일정 데이터를 기준으로 집계합니다.</p>
        </div>
        <div className="overview-network" aria-hidden="true">
          <span className="network-orbit orbit-one" /><span className="network-orbit orbit-two" />
          <span className="network-node node-one" /><span className="network-node node-two" /><span className="network-node node-three" />
        </div>
        <div className="overview-metrics">
          <div><span>구성원</span><strong>{formatNumber(memberCount)}</strong></div>
          <div><span>진행 과제</span><strong>{formatNumber(activeProjects)}</strong></div>
          <div><span>논문</span><strong>{formatNumber(publications.length)}</strong></div>
          <div><span>예정 일정</span><strong>{formatNumber(upcomingEvents.length)}</strong></div>
        </div>
      </section>

      <div className="dashboard-workspace-grid">
        <div className="dashboard-main-column">
          <section className="workspace-card recent-notices-card">
            <div className="workspace-card-header">
              <div><span className="card-kicker">공지</span><h2>최근 공지</h2></div>
              <Button size="sm" variant="ghost" onClick={() => actions.navigate("notices")}>전체 보기</Button>
            </div>
            <div className="compact-list">
              {notices.slice(0, 5).map((notice) => (
                <button key={notice.id} type="button" className="compact-list-row" onClick={() => actions.openNoticeDetail(notice)}>
                  <div className="compact-list-main">
                    <div className="inline-gap"><Badge value={notice.category} />{notice.is_pinned ? <span className="pin-label">고정</span> : null}</div>
                    <strong>{notice.title}</strong><span>{notice.author || "작성자 미상"}</span>
                  </div>
                  <time>{formatDateOnly(notice.created_at)}</time>
                </button>
              ))}
              {!notices.length ? <p className="empty-inline">등록된 공지가 없습니다.</p> : null}
            </div>
          </section>

          <section className="workspace-card schedule-card">
            <div className="workspace-card-header">
              <div><span className="card-kicker">일정</span><h2>이번 주 일정</h2></div>
              <Button size="sm" variant="ghost" onClick={() => actions.navigate("calendar")}>캘린더 열기</Button>
            </div>
            <div className="schedule-timeline">
              {upcomingEvents.map((event) => (
                <article key={event.id} className="schedule-row">
                  <div className="schedule-date"><strong>{formatDateOnly(event.start_datetime).slice(5)}</strong><span>{formatDateTime(event.start_datetime).slice(11)}</span></div>
                  <span className="schedule-line" />
                  <div className="schedule-content"><Badge value={event.event_type} /><strong>{event.title}</strong><p>{event.location || "장소 미정"}</p></div>
                </article>
              ))}
              {!upcomingEvents.length ? <p className="empty-inline">예정된 일정이 없습니다.</p> : null}
            </div>
          </section>

          <section className="workspace-card requests-card">
            <div className="workspace-card-header"><div><span className="card-kicker">신청</span><h2>최근 신청</h2></div></div>
            <div className="request-list">
              {recentRequests.map((request) => (
                <article key={`${request.requestType}-${request.id}`} className="request-row">
                  <span className="request-type">{request.requestType}</span>
                  <div><strong>{request.requestTitle || "신청"}</strong><p>{request.requesterName || "신청자 미상"}</p></div>
                  <Badge value={request.status} /><time>{formatDateOnly(dateValue(request))}</time>
                </article>
              ))}
              {!recentRequests.length ? <p className="empty-inline">최근 신청 내역이 없습니다.</p> : null}
            </div>
          </section>

          <section className="workspace-card research-card">
            <div className="workspace-card-header">
              <div><span className="card-kicker">연구</span><h2>연구 현황</h2></div>
              <Button size="sm" variant="ghost" onClick={() => actions.navigate("projects")}>과제 보기</Button>
            </div>
            <div className="research-grid">
              {projects.slice(0, 4).map((project) => (
                <article key={project.id} className="research-item">
                  <div><Badge value={project.status || "unknown"} /><span>{project.funding_agency || "지원기관 미정"}</span></div>
                  <strong>{project.title}</strong><p>{formatDateOnly(project.start_date)} ~ {formatDateOnly(project.end_date)}</p>
                </article>
              ))}
              {!projects.length ? <p className="empty-inline">등록된 연구과제가 없습니다.</p> : null}
            </div>
          </section>
        </div>

        <aside className="dashboard-analytics" aria-label="연구실 분석 현황">
          <section className="analytics-card attendance-analytics">
            <div className="analytics-card-title"><span>오늘 출결</span><strong>{presentToday}/{todayAttendance.length || memberCount}</strong></div>
            <div className="attendance-ring" style={{ "--progress": `${percent(presentToday, todayAttendance.length || memberCount)}%` }}>
              <div><strong>{percent(presentToday, todayAttendance.length || memberCount)}%</strong><span>출석</span></div>
            </div>
            <div className="analytics-meta"><span>출석·지각</span><strong>{presentToday}명</strong></div>
          </section>
          <section className="analytics-card">
            <div className="analytics-card-title"><span>휴가 현황</span><strong>{leaveRequests.length}</strong></div>
            <ProgressRow label="승인 대기" value={pendingLeave} total={leaveRequests.length} tone="amber" />
            <ProgressRow label="승인" value={approvedLeave} total={leaveRequests.length} tone="green" />
          </section>
          <section className="analytics-card">
            <div className="analytics-card-title"><span>연구 프로젝트</span><strong>{projects.length}</strong></div>
            <ProgressRow label="진행 중" value={activeProjects} total={projects.length} />
            <ProgressRow label="완료" value={projects.filter((project) => {
              const status = String(project.status).toLowerCase();
              return status === "completed" || status.startsWith("closed");
            }).length} total={projects.length} tone="slate" />
          </section>
          <section className="analytics-card">
            <div className="analytics-card-title"><span>논문 상태</span><strong>{publications.length}</strong></div>
            <ProgressRow label="심사 중" value={reviewingPapers} total={publications.length} tone="amber" />
            <ProgressRow label="게재 완료" value={publishedPapers} total={publications.length} tone="green" />
          </section>
        </aside>
      </div>
    </div>
  );
}
