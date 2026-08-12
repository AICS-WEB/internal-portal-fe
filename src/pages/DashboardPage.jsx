import { useEffect, useMemo, useState } from "react";
import { formatNumber, todayISO } from "../utils/format.js";

const WEEK_LABELS = ["월", "화", "수", "목", "금", "토"];
const DAY_SECONDS = 28800; // 8h work day

// Static demo bars for the weekly-hours card (attendance has no per-day hours yet).
const DEMO_BARS = [
  { label: "일", h: 34, dim: true },
  { label: "월", h: 96 },
  { label: "화", h: 62 },
  { label: "수", h: 104 },
  { label: "목", h: 78 },
  { label: "금", h: 132, hot: true },
  { label: "토", h: 28, dim: true },
];

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

const ROLE_LABELS = { member: "구성원", manager: "매니저", admin: "관리자" };

function pad(n) {
  return String(n).padStart(2, "0");
}

function fmtClock(sec) {
  const s = Math.max(0, sec);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}`;
}

function toDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function eventTimeLabel(event) {
  const d = toDate(event.start_datetime);
  if (!d) return event.location || "";
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function TimeTracker({ seedSeconds, seedRunning }) {
  const [sec, setSec] = useState(seedSeconds);
  const [running, setRunning] = useState(seedRunning);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const deg = `${Math.round(((sec % DAY_SECONDS) / DAY_SECONDS) * 360)}deg`;

  return (
    <div className="hr-card glass hr-row1">
      <div className="hr-card-head">
        <div className="hr-card-title">타임 트래커</div>
        <button type="button" className="hr-ico-btn" aria-label="열기">↗</button>
      </div>
      <div className="hr-tracker-ring-wrap">
        <div className="hr-tracker-ring" style={{ background: `conic-gradient(#afccee ${deg}, #e6ecf3 0)` }} />
        <div className="hr-tracker-disc">
          <div className="hr-tracker-time">{fmtClock(sec)}</div>
          <div className="hr-tracker-sub">업무 시간</div>
        </div>
      </div>
      <div className="hr-tracker-controls">
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="hr-round-btn" onClick={() => setRunning(true)} aria-label="시작">▶</button>
          <button type="button" className="hr-round-btn" onClick={() => setRunning(false)} aria-label="일시정지" style={{ letterSpacing: 2, fontSize: 12 }}>‖</button>
        </div>
        <button type="button" className="hr-round-btn dark" onClick={() => { setSec(0); setRunning(false); }} aria-label="초기화">↺</button>
      </div>
    </div>
  );
}

export default function DashboardPage({ data, currentUser }) {
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

  const weekEvents = useMemo(() => {
    const start = weekDays[0]?.iso;
    const end = weekDays[weekDays.length - 1]?.iso;
    return data.calendarEvents
      .filter((e) => {
        const day = e.start_datetime?.slice(0, 10);
        return day && start && end && day >= start && day <= end;
      })
      .sort((a, b) => String(a.start_datetime).localeCompare(String(b.start_datetime)))
      .slice(0, 2);
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

  // Time tracker seed from today's own attendance check-in when present.
  const myToday = data.attendanceRecords.find((r) => r.date === today && r.user_id === currentUser.id);
  const { seedSeconds, seedRunning } = useMemo(() => {
    if (myToday?.check_in) {
      const [h, m] = myToday.check_in.split(":").map(Number);
      const startMin = h * 60 + m;
      if (myToday.check_out) {
        const [oh, om] = myToday.check_out.split(":").map(Number);
        return { seedSeconds: Math.max(0, (oh * 60 + om - startMin) * 60), seedRunning: false };
      }
      const now = new Date();
      return { seedSeconds: Math.max(0, (now.getHours() * 60 + now.getMinutes() - startMin) * 60), seedRunning: true };
    }
    return { seedSeconds: 9320, seedRunning: true };
  }, [myToday]);

  const roleLabel = ROLE_LABELS[currentUser.role] || currentUser.role || "구성원";
  const doneCount = doneTasks.length;

  return (
    <>
      <div className="hr-greeting-row">
        <div className="hr-greeting">
          <h1>안녕하세요, {currentUser.name}님</h1>
          <div className="hr-metric-bars">
            <div style={{ width: 112 }}>
              <div className="hr-metric-cap">면접</div>
              <div className="hr-metric-pill ink">15%</div>
            </div>
            <div style={{ width: 84 }}>
              <div className="hr-metric-cap">채용</div>
              <div className="hr-metric-pill accent">15%</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="hr-metric-cap">프로젝트 시간</div>
              <div className="hr-metric-pill striped">60%</div>
            </div>
            <div style={{ width: 96 }}>
              <div className="hr-metric-cap">산출</div>
              <div className="hr-metric-pill outline">10%</div>
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
        <div className="hr-emp-card">
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

        {/* Weekly hours (demo chart) */}
        <div className="hr-card glass hr-row1">
          <div className="hr-card-head">
            <div className="hr-card-title">업무 시간</div>
            <button type="button" className="hr-ico-btn" aria-label="열기">↗</button>
          </div>
          <div className="hr-hours-value">
            <strong>6.1 h</strong>
            <span>이번 주<br />누적 업무</span>
          </div>
          <div className="hr-bars">
            {DEMO_BARS.map((b) => {
              const color = b.hot ? "#afccee" : b.dim ? "#d5dfec" : "#1a1a18";
              return (
                <div key={b.label} className="hr-bar-col">
                  <div className="hr-bar-track">
                    <div className="hr-bar" style={{ height: b.h, background: color }} />
                    <div className="hr-bar-dot" style={{ background: color }} />
                  </div>
                  <div className="hr-bar-label" style={{ color: b.hot ? "#5b82b4" : "#8a867c" }}>{b.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time tracker ← today's attendance */}
        <TimeTracker seedSeconds={seedSeconds} seedRunning={seedRunning} />

        {/* Onboarding (demo) */}
        <div className="hr-card glass hr-row1">
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
        <div className="hr-accordion glass">
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

        {/* Week calendar ← real calendarEvents */}
        <div className="hr-cal glass">
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
            {["8:00", "9:00", "10:00", "11:00"].map((h) => (
              <div key={h} className="hr-cal-hour">
                <div className="label">{h}</div>
                <div className="rule" />
              </div>
            ))}
            {weekEvents[0] ? (
              <div className="hr-cal-event dark" style={{ top: 44, left: "26%", width: "40%" }}>
                <div>
                  <div className="ev-title">{weekEvents[0].title}</div>
                  <div className="ev-sub">{eventTimeLabel(weekEvents[0])}</div>
                </div>
                <div className="hr-avatars">
                  <span style={{ background: "#8fb3dc", border: "2px solid #1a1a18" }} />
                  <span style={{ background: "#8a867c", border: "2px solid #1a1a18" }} />
                  <span style={{ background: "#dce5f0", border: "2px solid #1a1a18" }} />
                </div>
              </div>
            ) : null}
            {weekEvents[1] ? (
              <div className="hr-cal-event light" style={{ top: 132, left: "48%", width: "38%" }}>
                <div>
                  <div className="ev-title">{weekEvents[1].title}</div>
                  <div className="ev-sub">{eventTimeLabel(weekEvents[1])}</div>
                </div>
                <div className="hr-avatars">
                  <span style={{ background: "#dce5f0", border: "2px solid #fff" }} />
                  <span style={{ background: "#8fb3dc", border: "2px solid #fff" }} />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Tasks ← upcoming events */}
        <div className="hr-tasks">
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
