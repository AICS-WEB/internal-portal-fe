import BrandMark from "./BrandMark.jsx";
import { menuIcons } from "./icons.jsx";
import { hasRole } from "../utils/permissions.js";

const primaryItems = [
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
  { id: "credentials", label: "공용 계정" },
];

const secondaryItems = [
  { id: "admin", label: "사용자 관리", minRole: "admin" },
  { id: "mypage", label: "내 정보" },
];

function NavItem({ item, activePage, onNavigate, onClose }) {
  const Icon = menuIcons[item.id];
  return (
    <button
      type="button"
      className={activePage === item.id ? "active" : ""}
      aria-label={item.label}
      data-tooltip={item.label}
      onClick={() => {
        onNavigate(item.id);
        onClose();
      }}
    >
      <span className="workspace-nav-icon">{Icon ? <Icon /> : null}</span>
      <span className="workspace-nav-label">{item.label}</span>
    </button>
  );
}

export default function Sidebar({ activePage, onNavigate, isOpen, onClose, currentUser }) {
  const visibleSecondary = secondaryItems.filter((item) => !item.minRole || hasRole(currentUser, item.minRole));
  return (
    <>
      <aside className={`workspace-sidebar ${isOpen ? "open" : ""}`}>
        <button type="button" className="workspace-brand" aria-label="대시보드로 이동" onClick={() => { onNavigate("dashboard"); onClose(); }}>
          <BrandMark />
          <span>AICS</span>
        </button>

        <nav className="workspace-nav" aria-label="주 메뉴">
          <div className="workspace-nav-section">
            {primaryItems.map((item) => <NavItem key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onClose={onClose} />)}
          </div>
          <div className="workspace-nav-section workspace-nav-secondary">
            {visibleSecondary.map((item) => <NavItem key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} onClose={onClose} />)}
          </div>
        </nav>
      </aside>
      {isOpen ? <button type="button" className="workspace-sidebar-scrim" aria-label="메뉴 닫기" onClick={onClose} /> : null}
    </>
  );
}
