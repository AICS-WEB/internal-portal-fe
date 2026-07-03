const menuItems = [
  { id: "dashboard", label: "Dashboard", group: "Portal" },
  { id: "notices", label: "Notices", group: "Portal" },
  { id: "calendar", label: "Calendar", group: "Portal" },
  { id: "attendance", label: "Attendance", group: "Operations" },
  { id: "leave", label: "Leave", group: "Operations" },
  { id: "projects", label: "Projects", group: "Research" },
  { id: "publications", label: "Publications", group: "Research" },
  { id: "files", label: "Files", group: "Resources" },
  { id: "purchases", label: "Purchases", group: "Operations" },
  { id: "budget", label: "Budget", group: "Operations" },
  { id: "credentials", label: "Credentials", group: "Resources" },
  { id: "admin", label: "Admin", group: "Admin" },
  { id: "mypage", label: "My Page", group: "Admin" },
];

const groupedItems = menuItems.reduce((acc, item) => {
  acc[item.group] = acc[item.group] || [];
  acc[item.group].push(item);
  return acc;
}, {});

export default function Sidebar({ activePage, onNavigate, isOpen, onClose, currentUser }) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div>
            <strong>AICS Lab</strong>
            <span>Internal Hub</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="전체 메뉴">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div className="sidebar-group" key={group}>
              <span className="sidebar-group-label">{group}</span>
              {items.map((item) => (
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
            </div>
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
