const frequencies = [
  { value: "DAILY", label: "매일" },
  { value: "WEEKLY", label: "매주" },
  { value: "MONTHLY", label: "매월" },
  { value: "YEARLY", label: "매년" },
];

const weekdays = [
  ["MO", "월"], ["TU", "화"], ["WE", "수"], ["TH", "목"],
  ["FR", "금"], ["SA", "토"], ["SU", "일"],
];

function parseRule(value) {
  const parts = Object.fromEntries(String(value || "FREQ=WEEKLY")
    .replace(/^RRULE:/i, "")
    .split(";")
    .map((part) => part.split("="))
    .filter(([key, partValue]) => key && partValue));
  return {
    frequency: frequencies.some((item) => item.value === parts.FREQ) ? parts.FREQ : "WEEKLY",
    days: parts.BYDAY ? parts.BYDAY.split(",") : [],
    until: parts.UNTIL?.slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") || "",
  };
}

function makeRule({ frequency, days, until }) {
  const rule = [`FREQ=${frequency}`];
  if (frequency === "WEEKLY" && days.length) rule.push(`BYDAY=${days.join(",")}`);
  if (until) rule.push(`UNTIL=${until.replaceAll("-", "")}T235959Z`);
  return rule.join(";");
}

export default function RecurrenceField({ value, onChange }) {
  const parsed = parseRule(value);
  const update = (patch) => onChange(makeRule({ ...parsed, ...patch }));

  return (
    <fieldset className="recurrence-field">
      <legend>반복 주기</legend>
      <div className="recurrence-options">
        {frequencies.map((item) => (
          <label key={item.value} className={parsed.frequency === item.value ? "selected" : ""}>
            <input type="radio" name="recurrence-frequency" checked={parsed.frequency === item.value} onChange={() => update({ frequency: item.value })} />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      {parsed.frequency === "WEEKLY" ? (
        <div className="recurrence-days" aria-label="반복 요일">
          {weekdays.map(([day, label]) => (
            <label key={day} className={parsed.days.includes(day) ? "selected" : ""}>
              <input
                type="checkbox"
                checked={parsed.days.includes(day)}
                onChange={(event) => update({ days: event.target.checked ? [...parsed.days, day] : parsed.days.filter((item) => item !== day) })}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      ) : null}

      <label className="field recurrence-until">
        <span>반복 종료일</span>
        <input type="date" value={parsed.until} onChange={(event) => update({ until: event.target.value })} />
        <small className="field-help">비워 두면 종료일 없이 반복됩니다.</small>
      </label>
    </fieldset>
  );
}
