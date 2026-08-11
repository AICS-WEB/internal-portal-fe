"use client";
import { LayoutDashboard, Megaphone, CalendarDays, Clock3, Palmtree, ShoppingCart, WalletCards, BookOpen, Files, KeyRound, ShieldCheck, UserRound, LogOut, Bell, X } from "lucide-react";
import type { Role, User } from "../lib/types";

export type PageKey = "dashboard"|"notices"|"calendar"|"attendance"|"leave"|"purchases"|"budget"|"publications"|"files"|"credentials"|"admin"|"mypage";
const groups: { label: string; items: { key: PageKey; label: string; icon: typeof LayoutDashboard; role?: Role }[] }[] = [
  { label: "MAIN", items: [{key:"dashboard",label:"Dashboard",icon:LayoutDashboard},{key:"notices",label:"Notices",icon:Megaphone},{key:"calendar",label:"Calendar",icon:CalendarDays}] },
  { label: "OPERATIONS", items: [{key:"attendance",label:"Attendance",icon:Clock3},{key:"leave",label:"Leave",icon:Palmtree},{key:"purchases",label:"Purchases",icon:ShoppingCart},{key:"budget",label:"Budget",icon:WalletCards}] },
  { label: "RESEARCH", items: [{key:"publications",label:"Publications",icon:BookOpen}] },
  { label: "RESOURCES", items: [{key:"files",label:"Files",icon:Files},{key:"credentials",label:"Credentials",icon:KeyRound}] },
  { label: "ADMIN", items: [{key:"admin",label:"Admin",icon:ShieldCheck,role:"manager"}] },
];
const ranks = { member: 0, manager: 1, admin: 2 };
export default function Sidebar({ page, setPage, user, unread, open, close, onNotifications, onLogout }: { page: PageKey; setPage:(p:PageKey)=>void; user:User|null; unread:number; open:boolean; close:()=>void; onNotifications:()=>void; onLogout:()=>void }) {
  const role = user?.role || "member";
  return <><aside className={`sidebar ${open ? "open" : ""}`}>
    <div className="brand"><div className="brand-mark">A</div><div><strong>AICS Lab</strong><span>Internal Portal</span></div><button className="icon-button mobile-close" onClick={close} aria-label="메뉴 닫기"><X size={20}/></button></div>
    <button className="notification-link" onClick={onNotifications}><Bell size={17}/><span>Notifications</span>{unread > 0 && <b>{unread}</b>}</button>
    <nav>{groups.map(group => <div className="nav-group" key={group.label}><p>{group.label}</p>{group.items.filter(i => !i.role || ranks[role] >= ranks[i.role]).map(item => { const Icon = item.icon; return <button key={item.key} className={page===item.key?"active":""} onClick={()=>{setPage(item.key);close();}}><Icon size={18}/><span>{item.label}</span></button>; })}</div>)}</nav>
    <div className="profile-block"><button onClick={()=>setPage("mypage")}><span className="avatar">{String(user?.name || user?.email || "A").charAt(0).toUpperCase()}</span><span className="profile-copy"><strong>{String(user?.name || user?.email || "AICS Member")}</strong><small>{role}</small></span><UserRound size={17}/></button><button className="logout" onClick={onLogout}><LogOut size={16}/>Logout</button></div>
  </aside>{open && <button className="sidebar-scrim" onClick={close} aria-label="메뉴 닫기"/>}</>;
}
