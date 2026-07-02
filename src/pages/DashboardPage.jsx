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
      <section className="summary-grid">
        <StatCard label="오늘 출석 인원" value={`${todayAttendance.length}명`} note="현재 출근 기준" />
        <StatCard label="승인 대기 휴가" value={`${pendingLeave.length}건`} note="관리자 확인 필요" tone="warning" />
        <StatCard label="이번 주 일정" value={`${upcomingEvents.length}건`} note="공유 일정 포함" tone="indigo" />
        <StatCard label="대기 중 구매 신청" value={`${pendingPurchases.length}건`} note="예산 검토 필요" tone="success" />
      </section>

      <section className="quick-action-band">
        <SectionHeader title="빠른 실행" description="자주 쓰는 내부 업무를 바로 시작합니다." />
        <div className="button-row">
          {quickButtons.map((button) => (
            <Button key={button.resource} variant="primary" onClick={() => actions.openCreate(button.resource)}>
              {button.label}
            </Button>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel span-2">
          <SectionHeader title="최근 공지사항" />
          <div className="list-stack">
            {data.notices.slice(0, 4).map((notice) => (
              <article key={notice.id} className="list-item">
                <div>
                  <strong>{notice.title}</strong>
                  <p>
                    {notice.author} · {notice.created_at}
                  </p>
                </div>
                <Badge value={notice.category} />
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <SectionHeader title="오늘 일정" />
          <div className="list-stack">
            {(todayEvents.length ? todayEvents : upcomingEvents.slice(0, 3)).map((event) => (
              <article key={event.id} className="list-item">
                <div>
                  <strong>{event.title}</strong>
                  <p>
                    {formatDate(event.start_datetime)} · {event.location}
                  </p>
                </div>
                <Badge value={event.event_type} />
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <SectionHeader title="내 출결 상태" />
          <div className="attendance-card">
            <Badge value={myAttendance?.status || "absent"} />
            <strong>{myAttendance?.check_in ? `${myAttendance.check_in} 출근` : "출근 기록 없음"}</strong>
            <p>{myAttendance?.check_out ? `${myAttendance.check_out} 퇴근` : "퇴근 전 상태입니다."}</p>
          </div>
        </section>

        <section className="panel span-2">
          <SectionHeader title="최근 업로드 파일" />
          <div className="file-grid">
            {data.sharedFiles.slice(0, 3).map((file) => (
              <article key={file.id} className="mini-card">
                <Badge value={file.category} />
                <strong>{file.title}</strong>
                <p>{file.filename}</p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => actions.downloadFile(file)}
                  disabled={!actions.canAccess(file)}
                >
                  다운로드
                </Button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
