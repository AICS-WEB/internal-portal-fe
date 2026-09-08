// Lightweight inline icon set (stroke-based, inherits currentColor).
// Shared by Sidebar, StatCard and dashboard widgets so we avoid an icon dependency.

const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ children }) {
  return <svg {...base}>{children}</svg>;
}

export const IconDashboard = () => (
  <Svg><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></Svg>
);
export const IconNotice = () => (
  <Svg><path d="M3 11l16-6v14L3 13z" /><path d="M8 12v5a2 2 0 0 0 4 0v-4" /></Svg>
);
export const IconCalendar = () => (
  <Svg><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 3v3M16 3v3" /></Svg>
);
export const IconAttendance = () => (
  <Svg><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>
);
export const IconLeave = () => (
  <Svg><path d="M4 21c2-6 6-9 11-9" /><path d="M20 5c0 6-4 9-9 9 0-6 4-9 9-9z" /></Svg>
);
export const IconProjects = () => (
  <Svg><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Svg>
);
export const IconPublications = () => (
  <Svg><path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" /><path d="M14 4v5h5M8 13h8M8 17h5" /></Svg>
);
export const IconFiles = () => (
  <Svg><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></Svg>
);
export const IconPurchases = () => (
  <Svg><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M3 4h2l2.2 11.2a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.8L20.5 8H6" /></Svg>
);
export const IconBudget = () => (
  <Svg><rect x="3" y="6" width="18" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.5" /><path d="M6 10v4M18 10v4" /></Svg>
);
export const IconCredentials = () => (
  <Svg><circle cx="8" cy="12" r="4.5" /><path d="M12.5 12H21l-2 2 2 2M12.5 12l3 3" /></Svg>
);
export const IconAdmin = () => (
  <Svg><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9.5 12l1.8 1.8L15 10" /></Svg>
);
export const IconMyPage = () => (
  <Svg><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" /></Svg>
);
export const IconUsers = () => (
  <Svg><circle cx="9" cy="9" r="3.2" /><path d="M3.5 19c1-3.2 3-5 5.5-5s4.5 1.8 5.5 5" /><path d="M16 6.2A3.2 3.2 0 0 1 16 12M17.5 14c2 .6 3.4 2.3 4 5" /></Svg>
);
export const IconTrend = () => (
  <Svg><path d="M4 15l5-5 3 3 6-7" /><path d="M18 6h3v3" /></Svg>
);
export const IconClock = IconAttendance;

export const menuIcons = {
  dashboard: IconDashboard,
  notices: IconNotice,
  calendar: IconCalendar,
  attendance: IconAttendance,
  leave: IconLeave,
  projects: IconProjects,
  publications: IconPublications,
  files: IconFiles,
  purchases: IconPurchases,
  budget: IconBudget,
  credentials: IconCredentials,
  admin: IconAdmin,
  mypage: IconMyPage,
};
