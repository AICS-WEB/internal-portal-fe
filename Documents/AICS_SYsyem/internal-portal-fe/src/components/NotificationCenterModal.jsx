import { useMemo, useState } from "react";
import { hasRole } from "../utils/permissions.js";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";
import { formatDate } from "../utils/format.js";

const notificationTypes = ["general", "notice_created", "leave_requested", "purchase_requested"];
const notificationTypeLabels = {
  general: "일반",
  notice_created: "공지",
  leave_requested: "휴가",
  purchase_requested: "구매",
};

export default function NotificationCenterModal({
  notifications,
  currentUser,
  users,
  onClose,
  onMarkAllRead,
  onMarkRead,
  onOpenNotification,
  onSend,
}) {
  const [filter, setFilter] = useState("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState({ userId: "", type: "general", title: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [readingId, setReadingId] = useState(null);
  const [error, setError] = useState("");
  const unreadCount = notifications.filter((item) => !item.read).length;
  const rows = useMemo(
    () => notifications.filter((item) => filter === "all" || !item.read),
    [filter, notifications],
  );

  const submitNotification = async (event) => {
    event.preventDefault();
    if (!compose.userId || !compose.title.trim() || !compose.message.trim()) {
      setError("수신자, 제목, 내용을 모두 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSend({ ...compose, title: compose.title.trim(), message: compose.message.trim() });
      setCompose({ userId: "", type: "general", title: "", message: "" });
      setComposeOpen(false);
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const readNotification = async (id) => {
    setReadingId(id);
    setError("");
    try {
      await onMarkRead(id);
    } catch (readError) {
      setError(readError.message);
    } finally {
      setReadingId(null);
    }
  };

  return (
    <Modal
      title="알림 센터"
      description={`읽지 않은 알림 ${unreadCount}건`}
      onClose={onClose}
      maxWidth={760}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>닫기</Button>
          <Button variant="primary" onClick={onMarkAllRead} disabled={!unreadCount}>모두 읽음</Button>
        </>
      }
    >
      <div className="notification-toolbar">
        <div className="segmented-control">
          <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>전체</button>
          <button type="button" className={filter === "unread" ? "active" : ""} onClick={() => setFilter("unread")}>읽지 않음</button>
        </div>
        {hasRole(currentUser, "manager") ? (
          <Button size="sm" variant="secondary" onClick={() => setComposeOpen((open) => !open)}>알림 작성</Button>
        ) : null}
      </div>

      {composeOpen ? (
        <form className="feature-draft-card" onSubmit={submitNotification}>
          <div className="feature-draft-heading">
            <div>
              <strong>새 알림 발송</strong>
              <span>선택한 구성원에게 알림을 발송합니다.</span>
            </div>
            <Badge value="approved">연결됨</Badge>
          </div>
          <div className="form-grid compact-form-grid">
            <label className="field">
              <span>수신자</span>
              <select value={compose.userId} onChange={(event) => setCompose((value) => ({ ...value, userId: event.target.value }))}>
                <option value="">구성원 선택</option>
                {users.filter((user) => user.account_status === "approved").map((user) => (
                  <option key={user.id} value={user.id}>{user.name} · {user.email}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>알림 유형</span>
              <select value={compose.type} onChange={(event) => setCompose((value) => ({ ...value, type: event.target.value }))}>
                {notificationTypes.map((type) => <option key={type} value={type}>{notificationTypeLabels[type]}</option>)}
              </select>
            </label>
            <label className="field">
              <span>제목</span>
              <input type="text" value={compose.title} onChange={(event) => setCompose((value) => ({ ...value, title: event.target.value }))} placeholder="알림 제목" />
            </label>
            <label className="field">
              <span>내용</span>
              <textarea rows={3} value={compose.message} onChange={(event) => setCompose((value) => ({ ...value, message: event.target.value }))} placeholder="전달할 내용을 입력하세요." />
            </label>
            {error ? <div className="register-submit-error" role="alert">{error}</div> : null}
            <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "발송 중..." : "알림 발송"}</Button>
          </div>
        </form>
      ) : null}

      <div className="notification-list">
        {rows.length ? rows.map((notification) => (
          <article
            key={notification.id}
            className={`notification-item ${notification.read ? "" : "unread"}`}
            onClick={() => onOpenNotification(notification)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onOpenNotification(notification);
            }}
          >
            <span className="notification-dot" aria-hidden="true" />
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <small>{notificationTypeLabels[notification.type] || "일반"} · {formatDate(notification.created_at)}</small>
            </div>
            {!notification.read ? (
              <Button size="sm" variant="ghost" disabled={readingId === notification.id} onClick={() => readNotification(notification.id)}>
                {readingId === notification.id ? "처리 중..." : "읽음 처리"}
              </Button>
            ) : null}
          </article>
        )) : <p className="empty-inline">표시할 알림이 없습니다.</p>}
      </div>
      {!composeOpen && error ? <div className="register-submit-error" role="alert">{error}</div> : null}
    </Modal>
  );
}
