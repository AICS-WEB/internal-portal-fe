import BrandMark from "./BrandMark.jsx";
import { menuIcons } from "./icons.jsx";
import { formatLabel } from "../utils/format.js";
import { hasRole } from "../utils/permissions.js";

const menuGroups = [
  {
    label: "개요",
    items: [{ id: "dashboard", label: "대시보드" }],
  },
  {
    label: "업무",
    items: [
      { id: "notices", label: "공지사항" },
      { id: "calendar", label: "캘린더" },
      { id: "attendance", label: "출결" },
      { id: "leave", label: "휴가" },
    ],
  },
  {
    label: "연구",
    items: [
      { id: "projects", label: "연구과제" },
      { id: "publications", label: "논문" },
      { id: "files", label: "자료" },
    ],
  },
  {
    label: "운영",
    items: [
      { id: "purchases", label: "구매 신청" },
      { id: "budget", label: "예산" },
      { id: "credentials", label: "공용 계정" },
      { id: "admin", label: "사용자 관리", minRole: "manager" },
      { id: "mypage", label: "내 정보" },
    ],
  },
];

export default function Sidebar({ activePage, onNavigate, isOpen, onClose, currentUser }) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <BrandMark />
          <div>
            <strong>AICS Lab Hub</strong>
            <span>내부 포털</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="주 메뉴">
          {menuGroups.map((group) => {
            const items = group.items.filter((item) => !item.minRole || hasRole(currentUser, item.minRole));
            if (!items.length) return null;
            return (
              <div key={group.label} className="sidebar-group">
                <p className="sidebar-section-label">{group.label}</p>
                {items.map((item) => {
                  const Icon = menuIcons[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={activePage === item.id ? "active" : ""}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                    >
                      <span className="nav-ico">{Icon ? <Icon /> : null}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{currentUser.name.slice(0, 1)}</div>
          <div>
            <strong>{currentUser.name}</strong>
            <span>{formatLabel(currentUser.role)}</span>
          </div>
        </div>
      </aside>
      {isOpen ? <button type="button" className="sidebar-scrim" aria-label="메뉴 닫기" onClick={onClose} /> : null}
    </>
  );
}
