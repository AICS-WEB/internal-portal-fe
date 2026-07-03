import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { formatDate, todayISO } from "../utils/format.js";

export default function DashboardPage({ data, currentUser, actions }) {
  const today = todayISO();
  const todayAttendance = data.attendanceRecords.filter((record) => record.date === today);
  const pendingLeave = data.leaveRequests.filter((request) => request.status === "pending");
  const pendingPurchases = data.purchaseRequests.filter((request) => request.status === "pending");
  const todayEvents = data.calendarEvents.filter((event) => event.start_datetime?.slice(0, 10) === today);
  const upcomingEvents = data.calendarEvents.slice(0, 4);
  const myAttendance = todayAttendance.find((record) => record.user_id === currentUser.id);

  const quickButtons = [
    { label: "공지 작성", resource: "notices" },
    { label: "일정 등록", resource: "calendarEvents" },
    { label: "휴가 신청", resource: "leaveRequests" },
    { label: "파일 업로드", resource: "sharedFiles" },
    { label: "구매 신청", resource: "purchaseRequests" },
  ];

  return (
    <div className="page-stack">
      <section className="portal-masthead">
        <div>
          <span className="eyebrow">AICS Lab Official Internal System</span>
          <h1>AICS Lab Internal Hub</h1>
          <p>Research schedules, lab notices, documents, attendance, and operations in one place.</p>
        </div>
        <aside className="masthead-panel">
          <dl>
            <div>
              <dt>Today</dt>
              <dd>{today}</dd>
            </div>
            <div>
              <dt>Signed in as</dt>
              <dd>{currentUser.name}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{currentUser.role}</dd>
            </div>
          </dl>
          <div className="button-row">
            {quickButtons.slice(0, 3).map((button) => (
              <Button key={button.resource} size="sm" variant="secondary" onClick={() => actions.openCreate(button.resource)}>
                {button.label}
              </Button>
            ))}
          </div>
        </aside>
      </section>

      <section className="summary-grid">
        <StatCard label="오늘 출석 인원" value={`${todayAttendance.length}명`} note="현재 출근 기준" />
        <StatCard label="승인 대기 휴가" value={`${pendingLeave.length}건`} note="관리자 확인 필요" tone="warning" />
        <StatCard label="이번 주 일정" value={`${upcomingEvents.length}건`} note="공유 일정 포함" tone="indigo" />
        <StatCard label="대기 중 구매 신청" value={`${pendingPurchases.length}건`} note="예산 검토 필요" tone="success" />
      </section>

      <div className="dashboard-home-grid">
        <div className="dashboard-primary-column">
          <section className="panel home-section">
            <SectionHeader title="Recent Notices" />
            <div className="section-list">
            {data.notices.slice(0, 4).map((notice) => (
              <article key={notice.id} className="section-list-item">
                <div>
                  <div className="notice-meta">
                    <Badge value={notice.category} />
                    <span>{notice.created_at}</span>
                  </div>
                  <strong>{notice.title}</strong>
                  <p>
                    {notice.author} · 조회 {notice.views}
                  </p>
                </div>
              </article>
            ))}
            </div>
          </section>

          <section className="panel home-section">
            <SectionHeader title="Today Schedule" />
            <div className="section-list">
            {(todayEvents.length ? todayEvents : upcomingEvents.slice(0, 3)).map((event) => (
              <article key={event.id} className="section-list-item">
                <div>
                  <div className="notice-meta">
                    <Badge value={event.event_type} />
                    <Badge value={event.scope} />
                  </div>
                  <strong>{event.title}</strong>
                  <p>
                    {formatDate(event.start_datetime)} · {event.location}
                  </p>
                </div>
              </article>
            ))}
            </div>
          </section>

          <section className="panel home-section">
            <SectionHeader title="Research Projects" />
            <div className="section-list">
              {data.researchProjects.slice(0, 3).map((project) => (
                <article key={project.id} className="section-list-item">
                  <div>
                    <div className="notice-meta">
                      <Badge value={project.status} />
                      <span>{project.funding_agency}</span>
                    </div>
                    <strong>{project.title}</strong>
                    <p>
                      {project.start_date} - {project.end_date} · {project.role}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="dashboard-aside-column">
          <section className="panel home-section">
            <SectionHeader title="My Attendance" />
            <div className="attendance-card">
              <Badge value={myAttendance?.status || "absent"} />
              <strong>{myAttendance?.check_in ? `${myAttendance.check_in} 출근` : "출근 기록 없음"}</strong>
              <p>{myAttendance?.check_out ? `${myAttendance.check_out} 퇴근` : "퇴근 전 상태입니다."}</p>
            </div>
          </section>

          <section className="panel home-section">
            <SectionHeader title="Pending Tasks" />
            <div className="section-list compact">
              <article className="section-list-item">
                <strong>휴가 승인 대기</strong>
                <Badge value="pending">{pendingLeave.length}건</Badge>
              </article>
              <article className="section-list-item">
                <strong>구매 검토 대기</strong>
                <Badge value="pending">{pendingPurchases.length}건</Badge>
              </article>
              <article className="section-list-item">
                <strong>공용 파일</strong>
                <Badge value="template">{data.sharedFiles.length}개</Badge>
              </article>
            </div>
          </section>

          <section className="panel home-section">
            <SectionHeader title="Notifications" />
            <div className="section-list compact">
              {data.notifications.slice(0, 3).map((notification) => (
                <article key={notification.id} className="section-list-item">
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
