import { useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import EmptyState from "../components/EmptyState.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function NotificationsPage({ data, actions, resourceState }) {
  const [filter, setFilter] = useState("all");
  const rows = useMemo(
    () => data.notifications.filter((item) => filter === "all" || (filter === "unread" ? !item.read : item.read)),
    [data.notifications, filter],
  );

  const markRead = async (item) => {
    if (item.read) return;
    try {
      await actions.api.notificationsApi.markRead(item.id);
      await actions.refreshResource("notifications");
    } catch (error) {
      actions.showToast(error.message || "알림 처리에 실패했습니다.", "warning");
    }
  };

  const markAll = async () => {
    try {
      await actions.api.notificationsApi.markAllRead();
      await actions.refreshResource("notifications");
      actions.showToast("모든 알림을 읽음 처리했습니다.");
    } catch (error) {
      actions.showToast(error.message || "알림 처리에 실패했습니다.", "warning");
    }
  };

  return (
    <div className="page-stack">
      <SectionHeader
        title="Notifications"
        description="연구실 운영 알림을 한 곳에서 확인합니다."
        actions={<Button variant="secondary" onClick={markAll} disabled={!data.notifications.some((item) => !item.read)}>모두 읽음</Button>}
      />
      <section className="toolbar-panel">
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[{ value: "all", label: "전체" }, { value: "unread", label: "읽지 않음" }, { value: "read", label: "읽음" }]}
        />
      </section>
      <section className="notifications-page-list">
        {rows.map((item) => (
          <button key={item.id} type="button" className={`notification-page-item ${item.read ? "" : "unread"}`} onClick={() => markRead(item)}>
            <span className="notification-unread-dot" aria-hidden="true" />
            <span className="notification-item-content">
              <strong>{item.title}</strong>
              <span>{item.message}</span>
              <small>{String(item.created_at || item.createdAt || "").replace("T", " ").slice(0, 16)}</small>
            </span>
          </button>
        ))}
        {!rows.length ? <EmptyState title={resourceState?.notifications?.loading ? "알림을 불러오는 중입니다." : "표시할 알림이 없습니다."} description={resourceState?.notifications?.error} /> : null}
      </section>
    </div>
  );
}
