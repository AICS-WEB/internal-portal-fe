import { useMemo, useState } from "react";
import { hasRole } from "../utils/permissions.js";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";

export default function NotificationCenterModal({ notifications, currentUser, onClose, onMarkAllRead }) {
  const [filter, setFilter] = useState("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const rows = useMemo(
    () => notifications.filter((item) => filter === "all" || !item.read),
    [filter, notifications],
  );

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
        <section className="feature-draft-card">
          <div className="feature-draft-heading">
            <div>
              <strong>새 알림 발송</strong>
              <span>관리자 전체 공지 알림 UI</span>
            </div>
            <Badge value="pending">API 연결 예정</Badge>
          </div>
          <div className="form-grid compact-form-grid">
            <label className="field">
              <span>제목</span>
              <input type="text" placeholder="알림 제목" />
            </label>
            <label className="field">
              <span>내용</span>
              <textarea rows={3} placeholder="전달할 내용을 입력하세요." />
            </label>
            <Button variant="primary" disabled>알림 발송</Button>
          </div>
        </section>
      ) : null}

      <div className="notification-list">
        {rows.length ? rows.map((notification) => (
          <article key={notification.id} className={`notification-item ${notification.read ? "" : "unread"}`}>
            <span className="notification-dot" aria-hidden="true" />
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <small>{notification.created_at}</small>
            </div>
            {!notification.read ? <Button size="sm" variant="ghost" disabled>읽음 처리</Button> : null}
          </article>
        )) : <p className="empty-inline">표시할 알림이 없습니다.</p>}
      </div>
    </Modal>
  );
}
