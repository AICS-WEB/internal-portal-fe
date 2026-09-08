import { useMemo, useState } from "react";
import { formatNumber, toDateTimeInput, todayISO } from "../utils/format.js";

const WEEK_LABELS = ["월", "화", "수", "목", "금", "토"];
const HOURS = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const HOUR_START = 9;
const HOUR_END = 18;
const ROW_H = 44; // px per hour row

// HR-only concepts (benefits) kept as handoff demo content.
const BENEFITS = [
  { label: "퇴직연금", items: [{ icon: "₩", title: "DC형 적립", sub: "월 320,000원" }] },
  {
    label: "지급 장비",
    items: [
      { icon: "▭", title: "MacBook Air", sub: "M1 · 2023년 지급" },
      { icon: "▢", title: "Studio Display", sub: "27인치 · 2024년 지급" },
    ],
  },
  {
    label: "보상 요약",
    items: [
      { icon: "◈", title: "연봉", sub: "₩50,400,000" },
      { icon: "◇", title: "성과급", sub: "연 1회 · 3월" },
    ],
  },
  { label: "복리후생", items: [{ icon: "✦", title: "건강검진", sub: "연 1회 전액 지원" }] },
];

const TASK_ICONS = ["◇", "◆", "○", "◎", "□"];
const DEMO_TASKS = [
  { title: "면접", time: "9월 13일, 08:30" },
  { title: "팀 미팅", time: "9월 13일, 10:30" },
  { title: "프로젝트 업데이트", time: "9월 13일, 13:00" },
  { title: "3분기 목표 논의", time: "9월 13일, 14:45" },
  { title: "인사 규정 검토", time: "9월 13일, 16:30" },
];

const ROLE_LABELS = { member: "일반 구성원", manager: "관리자", admin: "최고 관리자" };

// Quick-create shortcuts (replaces the decorative metric bars in the greeting row).
const QUICK_ACTIONS = [
  { label: "공지 작성", resource: "notices", managerOnly: true },
  { label: "일정 등록", resource: "calendarEvents" },
  { label: "휴가 신청", resource: "leaveRequests" },
  { label: "파일 업로드", resource: "sharedFiles" },
  { label: "구매 신청", resource: "purchaseRequests" },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function eventTimeLabel(event) {
  const localValue = toDateTimeInput(event.start_datetime);
  const match = localValue.match(/^\d{4}-(\d{2})-(\d{2})T(\d{2}:\d{2})$/);
  if (!match) return event.location || "";
  return `${Number(match[1])}월 ${Number(match[2])}일 ${match[3]}`;
}

export default function DashboardPage({ data, currentUser, actions }) {
  const today = todayISO();
  const [openAcc, setOpenAcc] = useState(1);
  const [doneTasks, setDoneTasks] = useState([0, 1]);

  const memberCount = data.users.filter((u) => u.account_status === "approved").length || data.users.length;
  const pubCount = data.publications.length;
  const projectCount = data.researchProjects.length;

  // Week (Mon–Sat) for the calendar card, with today highlighted.
  const weekDays = useMemo(() => {
    const base = new Date();
    const dow = base.getDay(); // 0 Sun .. 6 Sat
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((dow + 6) % 7));
    return WEEK_LABELS.map((name, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      return { name, num: d.getDate(), iso, isToday: iso === today, month: d.getMonth() + 1, year: d.getFullYear() };
    });
  }, [today]);

  const monthLabel = weekDays.length ? `${weekDays[2].year}년 ${weekDays[2].month}월` : "";

  // Events placed on the week grid (Mon–Sat, 9:00–18:00) by weekday column and start time.
  const dayEvents = useMemo(() => {
    return data.calendarEvents
      .map((e) => {
        const localValue = toDateTimeInput(e.start_datetime);
        const day = localValue.slice(0, 10);
        const idx = weekDays.findIndex((d) => d.iso === day);
        const timeMatch = localValue.match(/T(\d{2}):(\d{2})$/);
        if (idx < 0 || !timeMatch) return null;
        const hour = Number(timeMatch[1]);
        const minute = Number(timeMatch[2]);
        const hourFloat = hour + minute / 60;
        if (hourFloat < HOUR_START || hourFloat >= HOUR_END) return null;
        return {
          id: e.id,
          title: e.title,
          type: e.event_type,
          time: `${pad(hour)}:${pad(minute)}`,
          idx,
          top: (hourFloat - HOUR_START) * ROW_H,
        };
      })
      .filter(Boolean);
  }, [data.calendarEvents, weekDays]);

  // Onboarding task list ← upcoming calendar events (fallback to demo).
  const taskItems = useMemo(() => {
    const upcoming = [...data.calendarEvents]
      .filter((e) => e.start_datetime)
      .sort((a, b) => String(a.start_datetime).localeCompare(String(b.start_datetime)))
      .slice(0, 5)
      .map((e, i) => ({ icon: TASK_ICONS[i % TASK_ICONS.length], title: e.title, time: eventTimeLabel(e) }));
    return upcoming.length ? upcoming : DEMO_TASKS.map((t, i) => ({ icon: TASK_ICONS[i], ...t }));
  }, [data.calendarEvents]);

  const roleLabel = ROLE_LABELS[currentUser.role] || currentUser.role || "구성원";
  const doneCount = doneTasks.length;

  return (
    <>
      <div className="hr-greeting-row">
        <div className="hr-greeting">
          <h1>안녕하세요, {currentUser.name}님</h1>
          <div className="hr-quick-wrap">
            <div className="hr-quick">
              {QUICK_ACTIONS.filter((action) => !action.managerOnly || actions.isManager).map((action) => (
                <button
                  key={action.resource}
                  type="button"
                  className="hr-quick-btn"
                  onClick={() => actions.openCreate(action.resource)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="hr-stats">
          <div>
            <div className="hr-stat-num"><span className="marker" />{formatNumber(memberCount)}</div>
            <div className="hr-stat-cap">구성원</div>
          </div>
          <div>
            <div className="hr-stat-num"><span className="marker" />{formatNumber(pubCount)}</div>
            <div className="hr-stat-cap">논문</div>
          </div>
          <div>
            <div className="hr-stat-num big"><span className="marker" />{formatNumber(projectCount)}</div>
            <div className="hr-stat-cap">과제</div>
          </div>
        </div>
      </div>

      <div className="hr-grid">
        {/* Employee card ← current user */}
        <div className="hr-emp-card hr-area-emp">
          {currentUser.profile_image ? (
            <img className="hr-emp-photo" src={currentUser.profile_image} alt="" />
          ) : (
            <svg width="100%" height="100%" aria-hidden="true">
              <defs>
                <pattern id="stripeA" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <rect width="12" height="12" fill="#e3eaf3" />
                  <rect width="4" height="12" fill="#cfdcec" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#stripeA)" />
            </svg>
          )}
          {!currentUser.profile_image ? <div className="hr-emp-chip">프로필 사진</div> : null}
          <div className="hr-emp-overlay">
            <div>
              <div className="hr-emp-name">{currentUser.name}</div>
              <div className="hr-emp-role">{currentUser.department || currentUser.research_topic || "AICS Lab"}</div>
            </div>
            <div className="hr-emp-pill">{roleLabel}</div>
          </div>
        </div>

        {/* Onboarding (demo) */}
        <div className="hr-card glass hr-row1 hr-area-onboard">
          <div className="hr-card-head" style={{ alignItems: "baseline" }}>
            <div className="hr-card-title">온보딩</div>
            <div className="hr-onboard-pct">18%</div>
          </div>
          <div className="hr-onboard-bars">
            <div style={{ flex: 1.5 }}>
              <div className="hr-onboard-cap">30%</div>
              <div className="hr-onboard-bar" style={{ height: 44, background: "#afccee" }}>과제</div>
            </div>
            <div style={{ flex: 1.2 }}>
              <div className="hr-onboard-cap">25%</div>
              <div className="hr-onboard-bar" style={{ height: 56, background: "#1a1a18" }} />
            </div>
            <div style={{ flex: 0.8 }}>
              <div className="hr-onboard-cap">0%</div>
              <div className="hr-onboard-bar" style={{ height: 40, background: "#dce5f0" }} />
            </div>
          </div>
          <div className="hr-onboard-foot">
            <div className="row"><span>서류 제출</span><span style={{ color: "#1a1a18", fontWeight: 500 }}>완료</span></div>
            <div className="divider" />
            <div className="row"><span>장비 지급</span><span style={{ color: "#8a867c" }}>대기</span></div>
          </div>
        </div>

        {/* Benefits accordion (demo) */}
        <div className="hr-accordion glass hr-area-benefits">
          {BENEFITS.map((row, i) => {
            const open = openAcc === i;
            return (
              <div key={row.label} className="hr-acc-row">
                <button type="button" className="hr-acc-head" onClick={() => setOpenAcc(open ? -1 : i)}>
                  {row.label}
                  <span className={`hr-acc-caret${open ? " open" : ""}`}>▼</span>
                </button>
                {open ? (
                  <div className="hr-acc-body">
                    {row.items.map((it) => (
                      <div key={it.title} className="hr-acc-item">
                        <div className="hr-acc-tile">{it.icon}</div>
                        <div className="body">
                          <div className="title">{it.title}</div>
                          <div className="sub">{it.sub}</div>
                        </div>
                        <div className="more">⋮</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Week calendar ← real calendarEvents, 9:00–18:00 */}
        <div className="hr-cal glass hr-area-cal">
          <div className="hr-cal-head">
            <div className="hr-cal-pill">{monthLabel ? `${weekDays[2].month - 1 || 12}월` : "이전"}</div>
            <div className="hr-cal-month">{monthLabel}</div>
            <div className="hr-cal-pill">{monthLabel ? `${(weekDays[2].month % 12) + 1}월` : "다음"}</div>
          </div>
          <div className="hr-cal-days">
            <div />
            {weekDays.map((d) => (
              <div key={d.iso} className="hr-cal-day">
                <div className="name">{d.name}</div>
                <div className={`num${d.isToday ? " today" : ""}`}>{d.num}</div>
              </div>
            ))}
          </div>
          <div className="hr-cal-grid">
            {HOURS.map((h) => (
              <div key={h} className="hr-cal-hour">
                <div className="label">{h}</div>
                <div className="rule" />
              </div>
            ))}
            {dayEvents.map((ev) => (
              <div
                key={ev.id}
                className={`hr-cal-ev ${ev.type === "meeting" || ev.type === "deadline" ? "dark" : "light"}`}
                style={{
                  top: ev.top,
                  left: `calc(66px + ${ev.idx} * ((100% - 66px) / 6) + 3px)`,
                  width: "calc((100% - 66px) / 6 - 6px)",
                }}
                title={`${ev.title} · ${ev.time}`}
              >
                <div className="ev-title">{ev.title}</div>
                <div className="ev-sub">{ev.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks ← upcoming events */}
        <div className="hr-tasks hr-area-tasks">
          <div className="hr-tasks-head">
            <div className="title">온보딩 과제</div>
            <div className="hr-tasks-count">{doneCount}<span className="den">/{taskItems.length}</span></div>
          </div>
          {taskItems.map((t, i) => {
            const done = doneTasks.includes(i);
            return (
              <button
                key={`${t.title}-${i}`}
                type="button"
                className={`hr-task${done ? " done" : ""}`}
                onClick={() => setDoneTasks((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : cur.concat(i)))}
              >
                <div className="hr-task-tile">{t.icon}</div>
                <div className="body">
                  <div className="hr-task-title">{t.title}</div>
                  <div className="hr-task-time">{t.time}</div>
                </div>
                <div className="hr-task-dot">{done ? "✓" : ""}</div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
