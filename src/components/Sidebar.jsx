const menuGroups = [
  {
    label: "HOME",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "⌂" },
      { id: "notifications", label: "Notifications", icon: "◉", badge: "notifications" },
      { id: "search", label: "Search", icon: "⌕" },
    ],
  },
  {
    label: "LAB",
    items: [
      { id: "notices", label: "Notices", icon: "▤" },
      { id: "calendar", label: "Calendar", icon: "□" },
      { id: "attendance", label: "Attendance", icon: "◷" },
      { id: "leave", label: "Leave", icon: "△" },
    ],
  },
  {
    label: "RESEARCH",
    items: [
      { id: "publications", label: "Publications", icon: "≡" },
      { id: "files", label: "Files", icon: "▱" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { id: "purchases", label: "Purchases", icon: "◎" },
      { id: "budget", label: "Budget", icon: "₩" },
      { id: "credentials", label: "Credentials", icon: "◆" },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { id: "applications", label: "Applications", icon: "◇", minRole: "manager" },
      { id: "admin", label: "Admin", icon: "⚙", minRole: "manager" },
    ],
  },
];

const roleRank = { member: 1, manager: 2, admin: 3 };

function canSee(user, minRole) {
  return !minRole || (roleRank[user?.role] || 0) >= roleRank[minRole];
}

export default function Sidebar({
  activePage,
  onNavigate,
  isOpen,
  onClose,
  currentUser,
  unreadCount = 0,
  onLogout,
}) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <button type="button" className="sidebar-brand" onClick={() => onNavigate("dashboard")}>
          <span className="brand-mark">AI</span>
          <span className="brand-copy">
            <strong>AICS Lab</strong>
            <small>Internal Portal</small>
          </span>
        </button>

        <nav className="sidebar-nav" aria-label="전체 메뉴">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter((item) => canSee(currentUser, item.minRole));
            if (!visibleItems.length) return null;
            return (
              <div className="sidebar-group" key={group.label}>
                <span className="sidebar-group-label">{group.label}</span>
                {visibleItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={activePage === item.id ? "active" : ""}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                  >
                    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge === "notifications" && unreadCount ? <span className="nav-badge">{unreadCount}</span> : null}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <button type="button" className="sidebar-profile" onClick={() => onNavigate("mypage")}>
            <span className="avatar">{String(currentUser?.name || "U").slice(0, 1)}</span>
            <span className="user-copy">
              <strong>{currentUser?.name || "사용자"}</strong>
              <small>{currentUser?.role || "member"}</small>
            </span>
          </button>
          <div className="sidebar-user-actions">
            <button type="button" onClick={() => onNavigate("mypage")}>My Page</button>
            <button type="button" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </aside>
      {isOpen ? <button type="button" className="sidebar-scrim" aria-label="메뉴 닫기" onClick={onClose} /> : null}
    </>
  );
}
