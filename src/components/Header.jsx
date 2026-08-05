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

  return (
    <header className="top-header">
      <div className="header-title-row">
        <div>
          <h1>{title}</h1>
          <p>AICS Lab 내부 운영 포털</p>
        </div>
      </div>

      <div className="header-tools">
        <SearchInput value={searchValue} onChange={onSearchChange} placeholder="전체 데이터 검색" />
        <Button variant="ghost" onClick={onShowNotifications}>
          알림 {unreadCount ? <span className="button-count">{unreadCount}</span> : null}
        </Button>
        <Button variant="ghost" onClick={onProfileClick}>
          {currentUser.name}
        </Button>
        <Button variant="secondary" onClick={onLogoutClick}>
          로그아웃
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
