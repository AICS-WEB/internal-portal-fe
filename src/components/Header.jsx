import { useState } from "react";
import Button from "./Button.jsx";
import SearchInput from "./SearchInput.jsx";
import { hasRole } from "../utils/permissions.js";

const quickItems = [
  { label: "공지 작성", resource: "notices", minRole: "manager" },
  { label: "일정 등록", resource: "calendarEvents" },
  { label: "휴가 신청", resource: "leaveRequests" },
  { label: "파일 업로드", resource: "sharedFiles" },
  { label: "구매 신청", resource: "purchaseRequests" },
];

function BellIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8.5a6 6 0 1 0-12 0c0 6-2 7.5-2 7.5h16s-2-1.5-2-7.5M14 20h-4" /></svg>;
}

export default function Header({
  title,
  searchValue,
  onSearchChange,
  currentUser,
  notifications,
  onMenuClick,
  onQuickCreate,
  onShowNotifications,
  onProfileClick,
  onLogoutClick,
}) {
  const [quickOpen, setQuickOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const visibleQuickItems = quickItems.filter((item) => !item.minRole || hasRole(currentUser, item.minRole));

  return (
    <header className="workspace-header">
      <div className="workspace-header-title">
        <button type="button" className="mobile-menu-button" aria-label="메뉴 열기" onClick={onMenuClick}>☰</button>
        <div><span>AICS LAB</span><strong>{title}</strong></div>
      </div>

      <div className="workspace-header-tools">
        <div className="workspace-search"><SearchInput value={searchValue} onChange={onSearchChange} placeholder="전체 데이터 검색" /></div>
        <div className="quick-create">
          <Button size="sm" variant="primary" onClick={() => setQuickOpen((open) => !open)}>빠른 생성</Button>
          {quickOpen ? (
            <div className="quick-menu">
              {visibleQuickItems.map((item) => (
                <button key={item.resource} type="button" onClick={() => { onQuickCreate(item.resource); setQuickOpen(false); }}>{item.label}</button>
              ))}
            </div>
          ) : null}
        </div>
        <button type="button" className="workspace-icon-button" aria-label="알림" onClick={onShowNotifications}>
          <BellIcon />{unreadCount ? <span>{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
        </button>
        <button type="button" className="workspace-profile-button" onClick={onProfileClick} aria-label="내 정보">
          {currentUser.profile_image ? <img src={currentUser.profile_image} alt="" /> : <span>{currentUser.name?.slice(0, 1) || "A"}</span>}
          <div><strong>{currentUser.name}</strong><small>내 정보</small></div>
        </button>
        <button type="button" className="workspace-logout-button" onClick={onLogoutClick}>로그아웃</button>
      </div>
    </header>
  );
}
