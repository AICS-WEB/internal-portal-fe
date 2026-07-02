const menuItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "notices", label: "Notices" },
  { id: "calendar", label: "Calendar" },
  { id: "attendance", label: "Attendance" },
  { id: "leave", label: "Leave" },
  { id: "projects", label: "Projects" },
  { id: "publications", label: "Publications" },
  { id: "files", label: "Files" },
  { id: "purchases", label: "Purchases" },
  { id: "budget", label: "Budget" },
  { id: "credentials", label: "Credentials" },
  { id: "admin", label: "Admin" },
  { id: "mypage", label: "My Page" },
];

export default function Sidebar({ activePage, onNavigate, isOpen, onClose, currentUser }) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">AI</div>
          <div>
            <strong>AICS Lab Hub</strong>
            <span>Internal Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="주 메뉴">
          {menuItems.map((item) => (
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
