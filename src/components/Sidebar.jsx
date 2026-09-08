import BrandMark from "./BrandMark.jsx";
import { menuIcons } from "./icons.jsx";
import { hasRole } from "../utils/permissions.js";

const menuGroups = [
  {
    label: "개요",
    items: [{ id: "dashboard", label: "Dashboard" }],
  },
  {
    label: "업무",
    items: [
      { id: "notices", label: "Notices" },
      { id: "calendar", label: "Calendar" },
      { id: "attendance", label: "Attendance" },
      { id: "leave", label: "Leave" },
    ],
  },
  {
    label: "연구",
    items: [
      { id: "projects", label: "Projects" },
      { id: "publications", label: "Publications" },
      { id: "files", label: "Files" },
    ],
  },
  {
    label: "운영",
    items: [
      { id: "purchases", label: "Purchases" },
      { id: "budget", label: "Budget" },
      { id: "credentials", label: "Credentials" },
      { id: "admin", label: "Admin", minRole: "manager" },
      { id: "mypage", label: "My Page" },
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
            <span>Internal Portal</span>
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
            <span>{currentUser.role}</span>
          </div>
        </div>
      </aside>
      {isOpen ? <button type="button" className="sidebar-scrim" aria-label="메뉴 닫기" onClick={onClose} /> : null}
    </>
  );
}
