import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import RecurringEventModal from "../components/RecurringEventModal.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { formatDate, toDateTimeInput } from "../utils/format.js";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthCells(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells = [];

  for (let i = 0; i < first.getDay(); i += 1) cells.push(null);
  for (let day = 1; day <= last.getDate(); day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, date });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarPage({ data, actions }) {
  const [recurringDraft, setRecurringDraft] = useState(null);
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const cells = useMemo(() => getMonthCells(displayedMonth), [displayedMonth]);
  const eventsByDate = useMemo(() => {
    return data.calendarEvents.reduce((acc, event) => {
      const date = toDateTimeInput(event.start_datetime).slice(0, 10);
      acc[date] = acc[date] || [];
      acc[date].push(event);
      return acc;
    }, {});
  }, [data.calendarEvents]);

  const moveMonth = (amount) => setDisplayedMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const moveToday = () => {
    const now = new Date();
    setDisplayedMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <div className="page-stack">
      <SectionHeader
        title="일정"
        description="공유 일정과 개인 일정을 함께 확인합니다."
        actions={
          <div className="button-row">
            <Button variant="primary" onClick={() => actions.openCreate("calendarEvents")}>
              일정 등록
            </Button>
            <Button variant="secondary" onClick={() => actions.openCreate("calendarEvents", { is_recurring: true, recurrence_rule: "FREQ=WEEKLY" })}>
              반복 일정 등록
            </Button>
          </div>
        }
      />

      <div className="calendar-layout">
      <section className="calendar-panel">
        <div className="calendar-month-nav" aria-label="달력 월 이동">
          <Button size="sm" variant="ghost" onClick={() => moveMonth(-1)} aria-label="이전 달">‹</Button>
          <strong>{displayedMonth.getFullYear()}년 {displayedMonth.getMonth() + 1}월</strong>
          <Button size="sm" variant="ghost" onClick={() => moveMonth(1)} aria-label="다음 달">›</Button>
          <Button size="sm" variant="secondary" onClick={moveToday}>오늘</Button>
        </div>
        <div className="calendar-weekdays">
          {weekdays.map((day, index) => (
            <span key={day} className={index === 0 ? "sunday" : index === 6 ? "saturday" : ""}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {cells.map((cell, index) => (
            <article key={`${cell?.date || "blank"}-${index}`} className={`calendar-cell ${cell ? "" : "muted"} ${index % 7 === 0 ? "sunday" : index % 7 === 6 ? "saturday" : ""}`}>
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

      <section className="panel calendar-events-panel">
        <SectionHeader title="일정 목록" />
        <div className="list-stack">
          {data.calendarEvents.map((event) => (
            <article key={event.id} className="list-item roomy calendar-event-item">
              <div>
                <div className="inline-gap">
                  <Badge value={event.event_type} />
                  <Badge value={event.scope} />
                  {event.is_recurring ? <Badge value="schedule">반복</Badge> : null}
                </div>
                <strong>{event.title}</strong>
                <p>
                  {formatDate(event.start_datetime)} - {formatDate(event.end_datetime)} · {event.location}
                </p>
              </div>
              {actions.canEditOwned(event) ? <div className="button-row">
                {event.is_recurring ? (
                  <Button size="sm" variant="secondary" onClick={() => setRecurringDraft(event)}>
                    반복 회차 관리
                  </Button>
                ) : null}
                <Button size="sm" variant="secondary" onClick={() => actions.openEdit("calendarEvents", event)}>
                  일정 수정
                </Button>
                <Button size="sm" variant="danger" onClick={() => actions.deleteItem("calendarEvents", event.id, "일정")}>
                  일정 삭제
                </Button>
              </div> : null}
            </article>
          ))}
        </div>
      </section>
      </div>

      {recurringDraft ? (
        <RecurringEventModal
          event={recurringDraft}
          onClose={() => setRecurringDraft(null)}
          onSaveException={actions.saveCalendarException}
          onSplit={actions.saveCalendarSplit}
        />
      ) : null}
    </div>
  );
}
