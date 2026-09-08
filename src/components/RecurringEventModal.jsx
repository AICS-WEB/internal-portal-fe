import { useState } from "react";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";
import { toDateTimeInput } from "../utils/format.js";

function localDatetime(value) {
  return toDateTimeInput(value);
}

function isoDatetime(value) {
  return value ? new Date(value).toISOString() : null;
}

function previousMinute(value) {
  if (!value) return "";
  return localDatetime(new Date(new Date(value).getTime() - 60 * 1000).toISOString());
}

export default function RecurringEventModal({ event, onClose, onSaveException, onSplit }) {
  const [exception, setException] = useState({
    originalDate: localDatetime(event.start_datetime).slice(0, 10),
    action: "modify",
    newTitle: event.title,
    newStart: localDatetime(event.start_datetime),
    newEnd: localDatetime(event.end_datetime),
  });
  const [split, setSplit] = useState({
    untilDatetime: previousMinute(event.start_datetime),
    startDatetime: localDatetime(event.start_datetime),
    endDatetime: localDatetime(event.end_datetime),
    title: event.title,
    recurrenceRule: event.recurrence_rule || "FREQ=WEEKLY",
  });
  const [submitting, setSubmitting] = useState("");
  const [error, setError] = useState("");

  const saveException = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!exception.originalDate) return setError("대상 회차를 선택해 주세요.");
    if (exception.action === "modify" && (!exception.newStart || !exception.newEnd)) {
      return setError("변경 시작과 종료 시각을 입력해 주세요.");
    }
    setSubmitting("exception");
    setError("");
    try {
      const payload = exception.action === "cancel"
        ? { originalDate: exception.originalDate, isCancelled: true }
        : {
            originalDate: exception.originalDate,
            isCancelled: false,
            newTitle: exception.newTitle || null,
            newStart: isoDatetime(exception.newStart),
            newEnd: isoDatetime(exception.newEnd),
          };
      await onSaveException(event.id, payload);
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSubmitting("");
    }
  };

  const saveSplit = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!split.untilDatetime || !split.startDatetime || !split.endDatetime) {
      return setError("기존 종료 시각과 새 시리즈 시작·종료 시각을 모두 입력해 주세요.");
    }
    setSubmitting("split");
    setError("");
    try {
      await onSplit(event.id, {
        untilDatetime: isoDatetime(split.untilDatetime),
        startDatetime: isoDatetime(split.startDatetime),
        endDatetime: isoDatetime(split.endDatetime),
        title: split.title || event.title,
        recurrenceRule: split.recurrenceRule || null,
      });
      onClose();
    } catch (splitError) {
      setError(splitError.message);
    } finally {
      setSubmitting("");
    }
  };

  return (
    <Modal
      title="반복 일정 관리"
      description={event.title}
      onClose={onClose}
      maxWidth={820}
      footer={<Button variant="secondary" onClick={onClose} disabled={Boolean(submitting)}>닫기</Button>}
    >
      {error ? <div className="register-submit-error recurring-error" role="alert">{error}</div> : null}
      <div className="feature-split-grid">
        <form className="feature-draft-card" onSubmit={saveException}>
          <div className="feature-draft-heading">
            <div><strong>특정 회차 변경</strong><span>한 회차만 수정하거나 취소합니다.</span></div>
            <Badge value="approved">연결됨</Badge>
          </div>
          <div className="form-grid compact-form-grid">
            <label className="field"><span>대상 회차</span><input type="date" value={exception.originalDate} onChange={(e) => setException((v) => ({ ...v, originalDate: e.target.value }))} /></label>
            <label className="field"><span>처리 방식</span><select value={exception.action} onChange={(e) => setException((v) => ({ ...v, action: e.target.value }))}><option value="modify">회차 수정</option><option value="cancel">회차 취소</option></select></label>
            {exception.action === "modify" ? (
              <>
                <label className="field"><span>변경 제목</span><input type="text" value={exception.newTitle} onChange={(e) => setException((v) => ({ ...v, newTitle: e.target.value }))} /></label>
                <label className="field"><span>변경 시작</span><input type="datetime-local" value={exception.newStart} onChange={(e) => setException((v) => ({ ...v, newStart: e.target.value }))} /></label>
                <label className="field"><span>변경 종료</span><input type="datetime-local" value={exception.newEnd} onChange={(e) => setException((v) => ({ ...v, newEnd: e.target.value }))} /></label>
              </>
            ) : <p className="feature-caption">선택한 날짜의 회차가 일정에서 제외됩니다.</p>}
            <Button type="submit" variant="primary" disabled={Boolean(submitting)}>{submitting === "exception" ? "저장 중..." : "회차 저장"}</Button>
          </div>
        </form>

        <form className="feature-draft-card" onSubmit={saveSplit}>
          <div className="feature-draft-heading">
            <div><strong>이후 일정 분리</strong><span>새 반복 시리즈로 분리합니다.</span></div>
            <Badge value="approved">연결됨</Badge>
          </div>
          <div className="form-grid compact-form-grid">
            <label className="field"><span>기존 시리즈 종료 기준</span><input type="datetime-local" value={split.untilDatetime} onChange={(e) => setSplit((v) => ({ ...v, untilDatetime: e.target.value }))} /></label>
            <label className="field"><span>새 시리즈 시작</span><input type="datetime-local" value={split.startDatetime} onChange={(e) => setSplit((v) => ({ ...v, startDatetime: e.target.value }))} /></label>
            <label className="field"><span>첫 회차 종료</span><input type="datetime-local" value={split.endDatetime} onChange={(e) => setSplit((v) => ({ ...v, endDatetime: e.target.value }))} /></label>
            <label className="field"><span>새 시리즈 제목</span><input type="text" value={split.title} onChange={(e) => setSplit((v) => ({ ...v, title: e.target.value }))} /></label>
            <label className="field"><span>반복 규칙</span><input type="text" value={split.recurrenceRule} onChange={(e) => setSplit((v) => ({ ...v, recurrenceRule: e.target.value }))} /></label>
            <Button type="submit" variant="primary" disabled={Boolean(submitting)}>{submitting === "split" ? "분리 중..." : "시리즈 분리"}</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
