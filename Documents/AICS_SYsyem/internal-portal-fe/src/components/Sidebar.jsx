import BrandMark from "./BrandMark.jsx";
import { hasRole } from "../utils/permissions.js";

const menuItems = [
  { id: "dashboard", label: "대시보드" },
  { id: "notices", label: "공지사항" },
  { id: "calendar", label: "일정" },
  { id: "attendance", label: "근태" },
  { id: "leave", label: "휴가" },
  { id: "projects", label: "연구과제" },
  { id: "publications", label: "논문" },
  { id: "files", label: "파일" },
  { id: "purchases", label: "구매" },
  { id: "budget", label: "예산" },
  { id: "credentials", label: "공용 계정" },
  { id: "admin", label: "관리", minRole: "manager" },
  { id: "mypage", label: "내 정보" },
];

export default function Sidebar({ activePage, onNavigate, isOpen, onClose, currentUser }) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <BrandMark />
          <div>
            <strong>AICS Lab Hub</strong>
            <span>내부 운영 포털</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="주 메뉴">
          {menuItems.filter((item) => !item.minRole || hasRole(currentUser, item.minRole)).map((item) => (
            <button
              key={item.id}
              type="button"
              className={activePage === item.id ? "active" : ""}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{currentUser.name.slice(0, 1)}</div>
          <div>
            <strong>{currentUser.name}</strong>
            <span>{currentUser.role}</span>
          </div>
        </div>
      </aside>
      {isOpen ? <button type="button" className="sidebar-scrim" aria-label="메뉴 닫기" onClick={onClose} /> : null}
    </>
  );
}
