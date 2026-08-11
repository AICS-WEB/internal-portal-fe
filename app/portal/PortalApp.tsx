"use client";
import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar, { type PageKey } from "../components/Sidebar";
import Notifications from "../components/Notifications";
import { api, authStore } from "../lib/api";
import type { User } from "../lib/types";
import AuthPages from "../pages/AuthPages";
import DashboardPage from "../pages/DashboardPage";
import CalendarPage from "../pages/CalendarPage";
import NoticesPage from "../pages/NoticesPage";
import PublicationsPage from "../pages/PublicationsPage";
import FilesPage from "../pages/FilesPage";
import CredentialsPage from "../pages/CredentialsPage";
import { AttendancePage, BudgetPage, LeavePage, PurchasesPage } from "../pages/OperationsPages";
import AdminPage from "../pages/AdminPage";
import MyPage from "../pages/MyPage";

export default function PortalApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [preview, setPreview] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<PageKey>("dashboard");
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [unread, setUnread] = useState(0);

  const loadUser = useCallback(async () => {
    if (sessionStorage.getItem("aics_preview_mode") === "1") {
      setPreview(true); setUser({ name: "UI Preview", email: "preview@local", role: "admin" }); setAuthenticated(true); return;
    }
    if (!authStore.access()) { setAuthenticated(false); return; }
    setAuthenticated(true);
    try { setUser(await api.users.me() as User); }
    catch (cause) { if ((cause as { status?: number }).status === 401) setAuthenticated(false); }
  }, []);
  const loadUnread = useCallback(async () => {
    try { const data = await api.notifications.count(); setUnread(Number(data.count || 0)); } catch { /* optional */ }
  }, []);

  useEffect(() => { void loadUser(); }, [loadUser]);
  useEffect(() => { if (preview) sessionStorage.setItem("aics_preview_mode", "1"); }, [preview]);
  useEffect(() => { if (authenticated && !preview) void loadUnread(); }, [authenticated, preview, loadUnread]);

  async function logout() {
    if (!preview) { try { await api.auth.logout(); } catch { /* local cleanup still runs */ } }
    authStore.clear(); sessionStorage.removeItem("aics_preview_mode"); setPreview(false); setAuthenticated(false); setUser(null);
  }

  if (!authenticated) return <AuthPages onLogin={() => { setAuthenticated(true); void loadUser(); }} onPreview={() => { sessionStorage.setItem("aics_preview_mode", "1"); setPreview(true); setUser({ name: "UI Preview", email: "preview@local", role: "admin" }); setAuthenticated(true); }}/>

  const role = user?.role || "member";
  const pages: Record<PageKey, React.ReactNode> = {
    dashboard: <DashboardPage user={user} onAttendance={() => setPage("attendance")}/>, notices: <NoticesPage role={role}/>, calendar: <CalendarPage/>, attendance: <AttendancePage/>, leave: <LeavePage role={role}/>, purchases: <PurchasesPage role={role}/>, budget: <BudgetPage role={role}/>, publications: <PublicationsPage/>, files: <FilesPage/>, credentials: <CredentialsPage/>, admin: <AdminPage/>, mypage: <MyPage/>,
  };
  return <div className="app-shell"><Sidebar page={page} setPage={setPage} user={user} unread={unread} open={menu} close={() => setMenu(false)} onNotifications={() => setNotifications(true)} onLogout={logout}/><main className="workspace"><button className="mobile-menu" onClick={() => setMenu(true)} aria-label="메뉴 열기"><Menu size={21}/>AICS Lab</button>{preview && <div className="preview-banner">UI 미리보기 모드 · API 데이터는 표시되지 않습니다.</div>}{pages[page]}</main>{notifications && <Notifications onClose={() => setNotifications(false)} onChanged={loadUnread}/>}</div>;
}
