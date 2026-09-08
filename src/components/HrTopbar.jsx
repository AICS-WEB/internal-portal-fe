import { useState } from "react";
import { hasRole } from "../utils/permissions.js";

const svgBase = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function GearIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" {...svgBase} aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8a1.65 1.65 0 0 0 1.51 1H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...svgBase} aria-hidden="true">
      <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.2 7.5-2.2 7.5h16.4S18 14.5 18 8.5" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

// Top nav pills map to the portal's real pages (Korean labels), role-filtered.
const NAV = [
  { id: "dashboard", label: "대시보드" },
  { id: "notices", label: "공지" },
  { id: "calendar", label: "캘린더" },
  { id: "attendance", label: "출결" },
  { id: "leave", label: "휴가" },
  { id: "projects", label: "과제" },
  { id: "publications", label: "논문" },
  { id: "files", label: "자료" },
  { id: "purchases", label: "구매" },
  { id: "budget", label: "예산" },
  { id: "credentials", label: "계정" },
  { id: "admin", label: "관리", minRole: "manager" },
  { id: "mypage", label: "마이" },
];

export default function HrTopbar({
  activePage,
  onNavigate,
  currentUser,
  notifications = [],
  onShowNotifications,
  onProfile,
  onLogout,
}) {
  const [bannerOpen, setBannerOpen] = useState(true);
  const unread = notifications.filter((item) => !item.read).length;
  const initial = (currentUser.name || "?").slice(0, 1);

  return (
    <div className="hr-topbar">
      <button type="button" className="hr-logo" onClick={() => onNavigate("dashboard")}>
        AICS Lab
      </button>

      <nav className="hr-nav" aria-label="주 메뉴">
        {NAV.filter((item) => !item.minRole || hasRole(currentUser, item.minRole)).map((item) => (
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

      <div className="hr-controls">

        <button type="button" className="hr-pill-btn" onClick={onProfile}>
          <GearIcon />
          설정
        </button>

        <button type="button" className="hr-icon-btn" aria-label="알림" onClick={onShowNotifications}>
          <BellIcon />
          {unread ? <span className="badge-dot" /> : null}
        </button>

        <button type="button" className="hr-avatar" onClick={onProfile} aria-label="내 프로필">
          {currentUser.profile_image ? <img src={currentUser.profile_image} alt="" /> : initial}
        </button>

        <button type="button" className="hr-pill-btn" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}
