import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { formatDate, todayISO } from "../utils/format.js";
import { hasRole } from "../utils/permissions.js";

export default function DashboardPage({ data, currentUser, actions, resourceState }) {
  const today = todayISO();
  const todayEvents = data.calendarEvents.filter((event) => event.start_datetime?.slice(0, 10) === today);
  const latestAttendance = data.attendanceRecords[0];
  const unreadNotifications = data.notifications.filter((item) => !item.read);
  const pendingApplications = hasRole(currentUser, "manager")
    ? data.applications.filter((item) => (item.status || "pending") === "pending")
    : [];

  return (
    <div className="page-stack">
      <section className="dashboard-intro">
        <div>
          <span className="eyebrow">{today}</span>
          <h2>{currentUser?.name || "구성원"}님, 안녕하세요.</h2>
          <p>오늘의 연구실 일정과 운영 알림을 확인하세요.</p>
        </div>
        <div className="button-row">
          <Button variant="secondary" onClick={() => actions.openCreate("calendarEvents")}>일정 등록</Button>
          <Button variant="primary" onClick={() => actions.checkAttendance("in")}>출근 처리</Button>
        </div>
      </section>

      <div className="dashboard-workspace">
        <section className="panel home-section dashboard-notices">
          <SectionHeader title="Recent Notices" description="최근 등록된 연구실 공지" />
          <div className="section-list">
            {data.notices.slice(0, 5).map((notice) => (
              <button key={notice.id} type="button" className="section-list-item is-button" onClick={() => actions.openDetail("공지 상세", notice)}>
                <div>
                  <div className="notice-meta">
                    <Badge value={notice.category} />
                    {notice.is_pinned ? <Badge value="important">고정</Badge> : null}
                    <span>{String(notice.created_at || "").slice(0, 10)}</span>
                  </div>
                  <strong>{notice.title}</strong>
                  <p>{notice.author || "작성자 정보 없음"}</p>
                </div>
                <span className="row-arrow" aria-hidden="true">›</span>
              </button>
            ))}
            {!data.notices.length ? (
              <EmptyState
                title={resourceState?.notices?.loading ? "공지를 불러오는 중입니다." : "등록된 공지가 없습니다."}
                description={resourceState?.notices?.error}
              />
            ) : null}
          </div>
        </section>

        <section className="panel home-section dashboard-today">
          <SectionHeader title="Today" description="오늘 일정과 출결" />
          <div className="today-attendance">
            <div>
              <span className="status-label">Attendance</span>
              <strong>{latestAttendance?.check_in ? `${formatDate(latestAttendance.check_in)} 출근` : "출결 기록 없음"}</strong>
              <p>{latestAttendance ? "이번 세션에서 처리한 최근 응답입니다." : "이력 조회 API는 제공되지 않습니다."}</p>
            </div>
            <div className="button-row">
              <Button size="sm" variant="secondary" onClick={() => actions.checkAttendance("in")}>출근</Button>
              <Button size="sm" variant="secondary" onClick={() => actions.checkAttendance("out")}>퇴근</Button>
            </div>
          </div>
          <div className="section-list compact">
            {todayEvents.map((event) => (
              <article key={event.id} className="section-list-item">
                <div>
                  <div className="notice-meta"><Badge value={event.event_type} /><Badge value={event.scope} /></div>
                  <strong>{event.title}</strong>
                  <p>{formatDate(event.start_datetime)} · {event.location || "장소 미정"}</p>
                </div>
              </article>
            ))}
            {!todayEvents.length ? <EmptyState title="오늘 등록된 일정이 없습니다." /> : null}
          </div>
        </section>

        <section className="panel home-section dashboard-pending">
          <SectionHeader title="Pending & Notifications" description="확인이 필요한 운영 항목" />
          <div className="section-list compact">
            {pendingApplications.slice(0, 3).map((item) => (
              <article key={item.id} className="section-list-item">
                <div><Badge value="pending" /><strong>{item.name} 지원서</strong><p>{item.department || item.email}</p></div>
              </article>
            ))}
            {unreadNotifications.slice(0, 4).map((item) => (
              <article key={item.id} className="section-list-item unread-row">
                <span className="notification-unread-dot" />
                <div><strong>{item.title}</strong><p>{item.message}</p></div>
              </article>
            ))}
            {!pendingApplications.length && !unreadNotifications.length ? <EmptyState title="확인이 필요한 새 항목이 없습니다." /> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
