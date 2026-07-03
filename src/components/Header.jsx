import { useState } from "react";
import Button from "./Button.jsx";
import SearchInput from "./SearchInput.jsx";

const quickItems = [
  { label: "공지 작성", resource: "notices" },
  { label: "일정 등록", resource: "calendarEvents" },
  { label: "휴가 신청", resource: "leaveRequests" },
  { label: "파일 업로드", resource: "sharedFiles" },
  { label: "구매 신청", resource: "purchaseRequests" },
];

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "notices", label: "Notices" },
  { id: "calendar", label: "Calendar" },
  { id: "projects", label: "Research" },
  { id: "files", label: "Resources" },
  { id: "admin", label: "Admin" },
];

export default function Header({
  activePage,
  searchValue,
  onSearchChange,
  currentUser,
  notifications,
  onMenuClick,
  onNavigate,
  onQuickCreate,
  onShowNotifications,
  onProfileClick,
}) {
  const [quickOpen, setQuickOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <header className="top-header">
      <div className="lab-header-brand">
        <Button className="mobile-menu-button" variant="ghost" size="sm" onClick={onMenuClick}>
          메뉴
        </Button>
        <button type="button" className="header-wordmark" onClick={() => onNavigate("dashboard")}>
          <span>AICS Lab Hub</span>
          <small>AI Convergence Software Lab Internal Portal</small>
        </button>
      </div>

      <nav className="lab-header-nav" aria-label="주요 섹션">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activePage === item.id ? "active" : ""}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="header-tools">
        <SearchInput value={searchValue} onChange={onSearchChange} placeholder="Search portal" />
        <Button variant="ghost" onClick={onShowNotifications}>
          알림 {unreadCount ? <span className="button-count">{unreadCount}</span> : null}
        </Button>
        <Button variant="ghost" onClick={onProfileClick}>
          {currentUser.name}
        </Button>
        <div className="quick-create">
          <Button variant="primary" onClick={() => setQuickOpen((open) => !open)}>
            빠른 생성
          </Button>
          {quickOpen ? (
            <div className="quick-menu">
              {quickItems.map((item) => (
                <button
                  key={item.resource}
                  type="button"
                  onClick={() => {
                    onQuickCreate(item.resource);
                    setQuickOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
