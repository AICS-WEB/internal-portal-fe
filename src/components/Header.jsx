import Button from "./Button.jsx";

export default function Header({ title, description, unreadCount, onMenuClick, onShowNotifications, onProfileClick }) {
  return (
    <header className="top-header">
      <div className="context-heading">
        <Button className="mobile-menu-button" variant="ghost" size="sm" onClick={onMenuClick} aria-label="메뉴 열기">
          메뉴
        </Button>
        <div>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
      <div className="header-tools">
        <button type="button" className="icon-button" onClick={onShowNotifications} aria-label={`알림 ${unreadCount || 0}개`}>
          <span aria-hidden="true">◉</span>
          {unreadCount ? <span className="button-count">{unreadCount}</span> : null}
        </button>
        <button type="button" className="icon-button" onClick={onProfileClick} aria-label="내 정보">
          <span aria-hidden="true">●</span>
        </button>
      </div>
    </header>
  );
}
