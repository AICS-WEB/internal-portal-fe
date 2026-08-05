import { useEffect, useMemo, useState } from "react";
import { clearAuthSession, readAuthSession, saveAuthSession } from "./api/auth.js";
import Button from "./components/Button.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import Header from "./components/Header.jsx";
import Modal from "./components/Modal.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Toast from "./components/Toast.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import BudgetPage from "./pages/BudgetPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import CredentialsPage from "./pages/CredentialsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import FilesPage from "./pages/FilesPage.jsx";
import LeavePage from "./pages/LeavePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MyPage from "./pages/MyPage.jsx";
import NoticesPage from "./pages/NoticesPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import PublicationsPage from "./pages/PublicationsPage.jsx";
import PurchasesPage from "./pages/PurchasesPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import {
  attendanceRecords,
  budgets,
  calendarEvents,
  expenses,
  leaveBalances,
  leaveRequests,
  mockCurrentUser,
  notices,
  notifications,
  publications,
  purchaseRequests,
  researchProjects,
  sharedCredentials,
  sharedFiles,
  users,
} from "./data/mockData.js";
import { todayISO } from "./utils/format.js";
import { canAccess } from "./utils/permissions.js";

const pageRegistry = {
  dashboard: { title: "Dashboard", component: DashboardPage },
  notices: { title: "Notices", component: NoticesPage },
  calendar: { title: "Calendar", component: CalendarPage },
  attendance: { title: "Attendance", component: AttendancePage },
  leave: { title: "Leave", component: LeavePage },
  projects: { title: "Projects", component: ProjectsPage },
  publications: { title: "Publications", component: PublicationsPage },
  files: { title: "Files", component: FilesPage },
  purchases: { title: "Purchases", component: PurchasesPage },
  budget: { title: "Budget", component: BudgetPage },
  credentials: { title: "Credentials", component: CredentialsPage },
  admin: { title: "Admin", component: AdminPage },
  mypage: { title: "My Page", component: MyPage },
};

const initialData = {
  users,
  notices,
  calendarEvents,
  attendanceRecords,
  leaveBalances,
  leaveRequests,
  researchProjects,
  publications,
  sharedFiles,
  purchaseRequests,
  budgets,
  expenses,
  sharedCredentials,
  notifications,
};

function cloneData(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.map((item) => ({ ...item }))]));
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function option(value, label = value) {
  return { value, label };
}

function buildResourceConfigs(currentUser, data) {
  return {
    notices: {
      createTitle: "공지 등록",
      editTitle: "공지 수정",
      submitCreate: "등록",
      submitEdit: "저장",
      defaults: { category: "general", is_pinned: false, attachment: "" },
      fields: [
        { name: "title", label: "title", type: "text" },
        {
          name: "category",
          label: "category",
          type: "select",
          options: ["general", "important", "account_info", "schedule"],
        },
        { name: "content", label: "content", type: "textarea" },
        { name: "is_pinned", label: "is_pinned", type: "checkbox" },
        { name: "attachment", label: "attachment placeholder", type: "text" },
      ],
      create: (values) => ({
        id: uid("notice"),
        ...values,
        author: currentUser.name,
        views: 0,
        created_at: todayISO(),
      }),
    },
    calendarEvents: {
      createTitle: "일정 등록",
      editTitle: "일정 수정",
      defaults: {
        event_type: "meeting",
        scope: "shared",
        start_datetime: `${todayISO()}T10:00`,
        end_datetime: `${todayISO()}T11:00`,
        is_recurring: false,
      },
      fields: [
        { name: "title", label: "title", type: "text" },
        { name: "description", label: "description", type: "textarea" },
        { name: "event_type", label: "event_type", type: "select", options: ["meeting", "deadline", "event", "trip", "other"] },
        { name: "scope", label: "scope", type: "select", options: ["shared", "personal"] },
        { name: "start_datetime", label: "start_datetime", type: "datetime-local" },
        { name: "end_datetime", label: "end_datetime", type: "datetime-local" },
        { name: "location", label: "location", type: "text" },
        { name: "is_recurring", label: "is_recurring", type: "checkbox" },
        { name: "recurrence_rule", label: "recurrence_rule", type: "text" },
      ],
      create: (values) => ({ id: uid("event"), ...values }),
    },
    leaveRequests: {
      createTitle: "휴가 신청",
      editTitle: "휴가 신청 수정",
      defaults: { leave_type: "annual", half_period: "", start_date: todayISO(), end_date: todayISO(), status: "pending" },
      fields: [
        { name: "leave_type", label: "leave_type", type: "select", options: ["annual", "half_day", "sick"] },
        { name: "half_period", label: "half_period", type: "select", options: ["", "AM", "PM"] },
        { name: "start_date", label: "start_date", type: "date" },
        { name: "end_date", label: "end_date", type: "date" },
        { name: "reason", label: "reason", type: "textarea" },
      ],
      create: (values) => ({
        id: uid("leave"),
        ...values,
        user_id: currentUser.id,
        user_name: currentUser.name,
        status: "pending",
        requested_at: todayISO(),
      }),
    },
    researchProjects: {
      createTitle: "과제 등록",
      editTitle: "과제 수정",
      defaults: { status: "active", role: "참여", start_date: todayISO(), end_date: todayISO() },
      fields: [
        { name: "title", label: "title", type: "text" },
        { name: "funding_agency", label: "funding_agency", type: "text" },
        { name: "start_date", label: "start_date", type: "date" },
        { name: "end_date", label: "end_date", type: "date" },
        { name: "role", label: "role", type: "text" },
        { name: "status", label: "status", type: "select", options: ["active", "closed"] },
      ],
      create: (values) => ({ id: uid("project"), ...values, owner: currentUser.name }),
    },
    publications: {
      createTitle: "논문 등록",
      editTitle: "논문 수정",
      defaults: { year: String(new Date().getFullYear()), pub_type: "conference", status: "writing", is_public: false },
      fields: [
        { name: "title", label: "title", type: "text" },
        { name: "authors_text", label: "authors_text", type: "text" },
        { name: "year", label: "year", type: "text" },
        { name: "published_date", label: "published_date", type: "date" },
        { name: "pub_type", label: "pub_type", type: "select", options: ["conference", "journal", "workshop", "patent", "demo"] },
        { name: "status", label: "status", type: "select", options: ["writing", "submitted", "under_review", "accepted", "published"] },
        { name: "venue", label: "venue", type: "text" },
        { name: "doi", label: "doi", type: "text" },
        { name: "is_public", label: "is_public", type: "checkbox" },
      ],
      create: (values) => ({ id: uid("pub"), ...values }),
    },
    sharedFiles: {
      createTitle: "파일 업로드",
      editTitle: "버전 업데이트",
      defaults: { category: "template", min_role: "member", storage_type: "internal", download_count: 0 },
      fields: [
        { name: "title", label: "title", type: "text" },
        { name: "description", label: "description", type: "textarea" },
        { name: "category", label: "category", type: "select", options: ["paper", "presentation", "template", "software", "other"] },
        { name: "min_role", label: "min_role", type: "select", options: ["member", "manager", "admin"] },
        { name: "filename", label: "filename", type: "text" },
        { name: "storage_type", label: "storage_type", type: "select", options: ["internal", "external"] },
        { name: "file_url", label: "file_url", type: "url" },
        { name: "filepath", label: "filepath", type: "text" },
      ],
      create: (values) => ({ id: uid("file"), ...values, download_count: 0, uploaded_at: todayISO() }),
    },
    purchaseRequests: {
      createTitle: "구매 신청",
      editTitle: "구매 신청 수정",
      defaults: { quantity: 1, estimated_price: 0, status: "pending" },
      fields: [
        { name: "item_name", label: "item_name", type: "text" },
        { name: "quantity", label: "quantity", type: "number" },
        { name: "estimated_price", label: "estimated_price", type: "number" },
        { name: "purchase_url", label: "purchase_url", type: "url" },
        { name: "reason", label: "reason", type: "textarea" },
      ],
      create: (values) => ({
        id: uid("purchase"),
        ...values,
        requester: currentUser.name,
        status: "pending",
        requested_at: todayISO(),
      }),
    },
    budgets: {
      createTitle: "예산 등록",
      editTitle: "예산 수정",
      defaults: { fund_type: "research", total_budget: 0, used_amount: 0, status: "active", start_date: todayISO(), end_date: todayISO() },
      fields: [
        { name: "name", label: "name", type: "text" },
        { name: "fund_type", label: "fund_type", type: "select", options: ["research", "operation", "conference"] },
        { name: "total_budget", label: "total_budget", type: "number" },
        { name: "start_date", label: "start_date", type: "date" },
        { name: "end_date", label: "end_date", type: "date" },
        { name: "status", label: "status", type: "select", options: ["active", "watch", "closed"] },
      ],
      create: (values) => ({ id: uid("budget"), ...values, used_amount: 0 }),
    },
    expenses: {
      createTitle: "지출 등록",
      editTitle: "지출 수정",
      defaults: { budget_id: data.budgets[0]?.id || "", category: "equipment", amount: 0, date: todayISO(), status: "pending" },
      fields: [
        { name: "budget_id", label: "budget_id", type: "select", options: data.budgets.map((budget) => option(budget.id, budget.name)) },
        { name: "category", label: "category", type: "select", options: ["equipment", "office", "conference", "other"] },
        { name: "item_name", label: "item_name", type: "text" },
        { name: "amount", label: "amount", type: "number" },
        { name: "date", label: "date", type: "date" },
      ],
      create: (values) => ({ id: uid("expense"), ...values, status: "pending", receipt: "" }),
    },
    sharedCredentials: {
      createTitle: "공용 계정 등록",
      editTitle: "공용 계정 수정",
      defaults: { category: "library", min_role: "member" },
      fields: [
        { name: "title", label: "title", type: "text" },
        { name: "category", label: "category", type: "text" },
        { name: "username", label: "username", type: "text" },
        { name: "password", label: "password", type: "password" },
        { name: "url", label: "url", type: "url" },
        { name: "memo", label: "memo", type: "textarea" },
        { name: "min_role", label: "min_role", type: "select", options: ["member", "manager", "admin"] },
      ],
      create: (values) => ({ id: uid("cred"), ...values, updated_at: todayISO() }),
    },
  };
}

function normalizeValues(fields, values) {
  return fields.reduce(
    (acc, field) => {
      if (field.type === "number") {
        acc[field.name] = Number(values[field.name]) || 0;
      }
      if (field.type === "checkbox") {
        acc[field.name] = Boolean(values[field.name]);
      }
      return acc;
    },
    { ...values },
  );
}

function FormModal({ modal, onClose, onSubmit }) {
  const [values, setValues] = useState(modal.initialValues || {});

  useEffect(() => {
    setValues(modal.initialValues || {});
  }, [modal]);

  const updateValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(normalizeValues(modal.fields, values));
  };

  return (
    <Modal
      title={modal.title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" form="portal-form" variant="primary">
            {modal.submitLabel || "저장"}
          </Button>
        </>
      }
    >
      <form id="portal-form" className="form-grid" onSubmit={handleSubmit}>
        {modal.fields.map((field) => {
          const value = values[field.name] ?? "";

          if (field.type === "checkbox") {
            return (
              <label key={field.name} className="checkbox-field">
                <input type="checkbox" checked={Boolean(value)} onChange={(event) => updateValue(field.name, event.target.checked)} />
                <span>{field.label}</span>
              </label>
            );
          }

          if (field.type === "textarea") {
            return (
              <label key={field.name} className="field">
                <span>{field.label}</span>
                <textarea value={value} rows={4} onChange={(event) => updateValue(field.name, event.target.value)} />
              </label>
            );
          }

          if (field.type === "select") {
            return (
              <label key={field.name} className="field">
                <span>{field.label}</span>
                <select value={value} onChange={(event) => updateValue(field.name, event.target.value)}>
                  {field.options.map((item) => {
                    const optionItem = typeof item === "string" ? option(item) : item;
                    return (
                      <option key={optionItem.value} value={optionItem.value}>
                        {optionItem.label || optionItem.value}
                      </option>
                    );
                  })}
                </select>
              </label>
            );
          }

          return (
            <label key={field.name} className="field">
              <span>{field.label}</span>
              <input type={field.type || "text"} value={value} onChange={(event) => updateValue(field.name, event.target.value)} />
            </label>
          );
        })}
      </form>
    </Modal>
  );
}

function DetailModal({ detail, onClose }) {
  if (!detail) return null;
  const content = Array.isArray(detail.content)
    ? detail.content
    : Object.entries(detail.content || {}).map(([label, value]) => ({ label, value }));

  return (
    <Modal title={detail.title} onClose={onClose} maxWidth={680}>
      <dl className="detail-grid">
        {content.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{typeof item.value === "boolean" ? (item.value ? "true" : "false") : String(item.value || "-")}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

export default function App() {
  const [authSession, setAuthSession] = useState(() => readAuthSession());
  const [showRegister, setShowRegister] = useState(() => window.location.hash === "#/register");
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(() => ({ ...mockCurrentUser, ...(readAuthSession()?.user || {}) }));
  const [data, setData] = useState(() => cloneData(initialData));
  const [formModal, setFormModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);

  const resourceConfigs = useMemo(() => buildResourceConfigs(currentUser, data), [currentUser, data]);
  const activeMeta = pageRegistry[activePage] || pageRegistry.dashboard;
  const ActivePage = activeMeta.component;

  useEffect(() => {
    const handleHashChange = () => setShowRegister(window.location.hash === "#/register");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "info") => {
    setToast({ id: Date.now(), message, type });
  };

  const updateCollection = (key, updater) => {
    setData((current) => ({
      ...current,
      [key]: typeof updater === "function" ? updater(current[key]) : updater,
    }));
  };

  const updateItem = (key, id, patch) => {
    updateCollection(key, (items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    showToast("상태가 변경되었습니다.");
  };

  const openCreate = (key, overrides = {}) => {
    const config = resourceConfigs[key];
    if (!config) return;
    setFormModal({
      title: config.createTitle,
      fields: config.fields,
      initialValues: { ...config.defaults, ...overrides },
      submitLabel: config.submitCreate || "등록",
      successMessage: `${config.createTitle}이 완료되었습니다.`,
      onSubmit: (values) => {
        updateCollection(key, (items) => [config.create(values), ...items]);
      },
    });
  };

  const openEdit = (key, item) => {
    const config = resourceConfigs[key];
    if (!config) return;
    setFormModal({
      title: config.editTitle,
      fields: config.fields,
      initialValues: item,
      submitLabel: config.submitEdit || "저장",
      successMessage: `${config.editTitle}이 완료되었습니다.`,
      onSubmit: (values) => {
        updateCollection(key, (items) => items.map((current) => (current.id === item.id ? { ...current, ...values } : current)));
      },
    });
  };

  const openForm = (modal) => {
    setFormModal(modal);
  };

  const deleteItem = (key, id, label) => {
    setConfirmModal({
      title: "삭제 확인",
      message: `${label} 데이터를 삭제할까요?`,
      confirmLabel: "삭제",
      onConfirm: () => {
        updateCollection(key, (items) => items.filter((item) => item.id !== id));
        setConfirmModal(null);
        showToast(`${label} 데이터가 삭제되었습니다.`);
      },
    });
  };

  const openDetail = (title, content) => {
    setDetailModal({ title, content });
  };

  const downloadFile = (file) => {
    if (!canAccess(currentUser, file)) {
      showToast("접근 권한이 없습니다.", "warning");
      return;
    }
    updateCollection("sharedFiles", (items) =>
      items.map((item) => (item.id === file.id ? { ...item, download_count: item.download_count + 1 } : item)),
    );
    showToast(`${file.filename} 다운로드가 준비되었습니다.`);
  };

  const copyText = (text, message = "복사되었습니다.") => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast(message);
  };

  const updateCurrentUser = (patch) => {
    setCurrentUser((current) => ({ ...current, ...patch }));
    updateCollection("users", (items) => items.map((item) => (item.id === currentUser.id ? { ...item, ...patch } : item)));
  };

  const showNotifications = () => {
    openDetail(
      "알림",
      data.notifications.map((notification) => ({
        label: notification.title,
        value: `${notification.message} · ${notification.created_at}`,
      })),
    );
  };

  const submitForm = (values) => {
    formModal.onSubmit(values);
    showToast(formModal.successMessage || "저장되었습니다.");
    setFormModal(null);
  };

  const actions = {
    openCreate,
    openEdit,
    openForm,
    openDetail,
    deleteItem,
    updateItem,
    updateCollection,
    showToast,
    downloadFile,
    copyText,
    updateCurrentUser,
    canAccess: (item) => canAccess(currentUser, item),
  };

  const openRegister = () => {
    window.location.hash = "/register";
    setShowRegister(true);
  };

  const closeRegister = () => {
    window.location.hash = "/login";
    setShowRegister(false);
  };

  const handleLogin = (session) => {
    saveAuthSession(session);
    setAuthSession(session);
    setCurrentUser((current) => ({ ...current, ...session.user, account_status: "approved" }));
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    setShowRegister(false);
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthSession(null);
    setShowRegister(false);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  };

  if (!authSession && showRegister) {
    return <RegisterPage onBack={closeRegister} />;
  }

  if (!authSession) {
    return <LoginPage onLogin={handleLogin} onRegister={openRegister} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        currentUser={currentUser}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={setActivePage}
      />

      <main className="main-shell">
        <Header
          title={activeMeta.title}
          searchValue={globalSearch}
          onSearchChange={setGlobalSearch}
          currentUser={currentUser}
          notifications={data.notifications}
          onMenuClick={() => setSidebarOpen(true)}
          onQuickCreate={openCreate}
          onShowNotifications={showNotifications}
          onProfileClick={() => setActivePage("mypage")}
          onLogoutClick={handleLogout}
        />
        <div className="content-area">
          <ActivePage data={data} currentUser={currentUser} actions={actions} globalSearch={globalSearch} />
        </div>
      </main>

      {formModal ? <FormModal modal={formModal} onClose={() => setFormModal(null)} onSubmit={submitForm} /> : null}
      {detailModal ? <DetailModal detail={detailModal} onClose={() => setDetailModal(null)} /> : null}
      {confirmModal ? (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      ) : null}
      <Toast toast={toast} />
    </div>
  );
}
