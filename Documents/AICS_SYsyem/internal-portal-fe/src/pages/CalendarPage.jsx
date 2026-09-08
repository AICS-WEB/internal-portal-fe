import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import RecurringEventModal from "../components/RecurringEventModal.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { formatDate } from "../utils/format.js";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthCells(events) {
  const baseDate = events[0]?.start_datetime ? new Date(events[0].start_datetime) : new Date();
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
  const cells = useMemo(() => getMonthCells(data.calendarEvents), [data.calendarEvents]);
  const eventsByDate = useMemo(() => {
    return data.calendarEvents.reduce((acc, event) => {
      const date = event.start_datetime?.slice(0, 10);
      acc[date] = acc[date] || [];
      acc[date].push(event);
      return acc;
    }, {});
  }, [data.calendarEvents]);

  return (
    <div className="page-stack">
      <SectionHeader
        title="Calendar"
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

      <section className="calendar-panel">
        <div className="calendar-weekdays">
          {weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
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

      <section className="panel">
        <SectionHeader title="일정 목록" />
        <div className="list-stack">
          {data.calendarEvents.map((event) => (
            <article key={event.id} className="list-item roomy">
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
              <div className="button-row">
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
              </div>
            </article>
          ))}
        </div>
      </section>

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
