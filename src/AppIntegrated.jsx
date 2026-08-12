import { useCallback, useEffect, useMemo, useState } from "react";
import { applicationsApi } from "./api/applicationsApi.js";
import { attendanceApi } from "./api/attendanceApi.js";
import { budgetApi } from "./api/budgetApi.js";
import { calendarApi } from "./api/calendarApi.js";
import { credentialsApi } from "./api/credentialsApi.js";
import { filesApi } from "./api/filesApi.js";
import { leaveApi } from "./api/leaveApi.js";
import {
  calendarToForm,
  credentialToForm,
  fileToForm,
  normalizeNotification,
  normalizeNotice,
  publicationToForm,
} from "./api/mappers.js";
import { notificationsApi } from "./api/notificationsApi.js";
import { noticesApi } from "./api/noticesApi.js";
import { procurementApi } from "./api/procurementApi.js";
import { publicationsApi } from "./api/publicationsApi.js";
import { usersApi } from "./api/usersApi.js";
import Button from "./components/Button.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import Header from "./components/Header.jsx";
import LoadingState from "./components/LoadingState.jsx";
import Modal from "./components/Modal.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Toast from "./components/Toast.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import ApplyPage from "./pages/ApplyPage.jsx";
import {
  AdminApiPage,
  AttendanceApiPage,
  BudgetApiPage,
  CalendarApiPage,
  CredentialsApiPage,
  FilesApiPage,
  LeaveApiPage,
  MyApiPage,
  NoticesApiPage,
  ProjectsApiPage,
  PublicationsApiPage,
  PurchasesApiPage,
} from "./pages/ApiPages.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ApplicationsPage from "./pages/ApplicationsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import { todayISO } from "./utils/format.js";
import { canAccess, hasRole } from "./utils/permissions.js";

const pageRegistry = {
  dashboard: { title: "Dashboard", description: "연구실의 오늘과 최근 운영 흐름", component: DashboardPage },
  notifications: { title: "Notifications", description: "내게 도착한 연구실 운영 알림", component: NotificationsPage },
  search: { title: "Search", description: "공지, 일정, 논문, 파일 통합 검색", component: SearchPage },
  notices: { title: "Notices", description: "구성원을 위한 공지와 운영 안내", component: NoticesApiPage },
  calendar: { title: "Calendar", description: "공유 일정과 개인 일정 관리", component: CalendarApiPage },
  attendance: { title: "Attendance", description: "오늘의 출근과 퇴근 처리", component: AttendanceApiPage },
  leave: { title: "Leave", description: "휴가 신청과 검토", component: LeaveApiPage },
  projects: { title: "Projects", description: "연구과제 정보", component: ProjectsApiPage },
  publications: { title: "Publications", description: "연구실 논문과 출판 상태", component: PublicationsApiPage },
  files: { title: "Files", description: "공용 문서와 연구 자료", component: FilesApiPage },
  purchases: { title: "Purchases", description: "물품 구매 신청과 처리", component: PurchasesApiPage },
  budget: { title: "Budget", description: "연구비 지출 신청과 검토", component: BudgetApiPage },
  credentials: { title: "Credentials", description: "공용 계정과 접근 정보", component: CredentialsApiPage },
  applications: { title: "Applications", description: "연구실 지원서 검토 워크플로", component: ApplicationsPage },
  admin: { title: "Admin", description: "운영 데이터와 관리자 도구", component: AdminApiPage },
  mypage: { title: "My Page", description: "내 계정과 프로필 정보", component: MyApiPage },
};

const initialData = {
  notices: [],
  calendarEvents: [],
  attendanceRecords: [],
  leaveRequests: [],
  researchProjects: [],
  publications: [],
  sharedFiles: [],
  purchaseRequests: [],
  budgets: [],
  expenses: [],
  sharedCredentials: [],
  notifications: [],
  applications: [],
  adminDashboard: null,
};

const readableResources = ["notices", "calendarEvents", "publications", "sharedFiles", "sharedCredentials", "notifications"];

function option(value, label = value) {
  return { value, label };
}

function currentDateTime(hour = 9) {
  return `${todayISO()}T${String(hour).padStart(2, "0")}:00`;
}

function calendarRange() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), 0, 1, 0, 0, 0).toISOString(),
    end: new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0).toISOString(),
  };
}

function normalizeValues(fields, values) {
  return fields.reduce(
    (acc, field) => {
      if (field.type === "number") acc[field.name] = Number(values[field.name]) || 0;
      if (field.type === "checkbox") acc[field.name] = Boolean(values[field.name]);
      return acc;
    },
    { ...values },
  );
}

function buildResourceConfigs({ refreshResource, updateCollection }) {
  return {
    notices: {
      minRole: "manager",
      createTitle: "공지 등록",
      defaults: { category: "general", isPinned: false, attachmentStorageType: "drive" },
      fields: [
        { name: "title", label: "title", type: "text", required: true },
        { name: "category", label: "category", type: "select", options: ["general", "important", "account_info", "schedule"] },
        { name: "content", label: "content", type: "textarea", required: true },
        { name: "isPinned", label: "isPinned", type: "checkbox" },
        { name: "attachmentFilename", label: "attachment filename", type: "text" },
        { name: "attachmentStorageType", label: "attachment storageType", type: "select", options: ["drive", "nas"] },
        { name: "attachmentFileUrl", label: "attachment fileUrl", type: "url" },
        { name: "attachmentFilepath", label: "attachment filepath", type: "text" },
      ],
      create: async (values) => {
        await noticesApi.createNotice(values);
        await refreshResource("notices");
      },
    },
    calendarEvents: {
      createTitle: "일정 등록",
      editTitle: "일정 수정",
      defaults: {
        eventType: "meeting",
        scope: "shared",
        startDatetime: currentDateTime(10),
        endDatetime: currentDateTime(11),
        isAllDay: false,
        isRecurring: false,
      },
      fields: [
        { name: "title", label: "title", type: "text", required: true },
        { name: "description", label: "description", type: "textarea" },
        { name: "eventType", label: "eventType", type: "select", options: ["meeting", "deadline", "event", "trip", "other"] },
        { name: "scope", label: "scope", type: "select", options: ["shared", "personal"] },
        { name: "startDatetime", label: "startDatetime", type: "datetime-local", required: true },
        { name: "endDatetime", label: "endDatetime", type: "datetime-local", required: true },
        { name: "isAllDay", label: "isAllDay", type: "checkbox" },
        { name: "location", label: "location", type: "text" },
        { name: "isRecurring", label: "isRecurring", type: "checkbox" },
        { name: "recurrenceRule", label: "recurrenceRule", type: "text" },
        { name: "participantsText", label: "participants user IDs (comma)", type: "text" },
      ],
      toForm: calendarToForm,
      create: async (values) => {
        await calendarApi.createEvent(values);
        await refreshResource("calendarEvents");
      },
      update: async (item, values) => {
        await calendarApi.updateEvent(item.id, values);
        await refreshResource("calendarEvents");
      },
      delete: async (item) => {
        await calendarApi.deleteEvent(item.id);
        await refreshResource("calendarEvents");
      },
    },
    leaveRequests: {
      createTitle: "휴가 신청",
      defaults: { leaveType: "annual", halfPeriod: "am", startDate: todayISO(), endDate: todayISO() },
      fields: [
        { name: "leaveType", label: "leaveType", type: "select", options: ["annual", "half", "other"] },
        { name: "halfPeriod", label: "halfPeriod", type: "select", options: ["am", "pm"] },
        { name: "startDate", label: "startDate", type: "date", required: true },
        { name: "endDate", label: "endDate", type: "date", required: true },
        { name: "reason", label: "reason", type: "textarea" },
      ],
      create: async (values) => {
        const data = await leaveApi.requestLeave(values);
        const row = data?.request ? { ...data.request, sessionOnly: true } : { ...data, sessionOnly: true };
        updateCollection("leaveRequests", (items) => [row, ...items]);
      },
    },
    publications: {
      createTitle: "논문 등록",
      editTitle: "논문 수정",
      defaults: { year: new Date().getFullYear(), pubType: "intl_conf", status: "writing", isPublic: false },
      fields: [
        { name: "title", label: "title", type: "text", required: true },
        { name: "authorsText", label: "authorsText", type: "text", required: true },
        { name: "year", label: "year", type: "number", required: true },
        { name: "publishedDate", label: "publishedDate", type: "date" },
        { name: "pubType", label: "pubType", type: "select", options: ["sci", "kci", "intl_conf", "domestic_conf"] },
        { name: "status", label: "status", type: "select", options: ["writing", "submitted", "under_review", "accepted", "published"] },
        { name: "venue", label: "venue", type: "text" },
        { name: "doi", label: "doi", type: "text" },
        { name: "isPublic", label: "isPublic", type: "checkbox" },
        { name: "authorsTextIds", label: "lab author user IDs (comma)", type: "text" },
      ],
      toForm: publicationToForm,
      create: async (values) => {
        await publicationsApi.createPublication(values);
        await refreshResource("publications");
      },
      update: async (item, values) => {
        await publicationsApi.updatePublication(item.id, values);
        await refreshResource("publications");
      },
      delete: async (item) => {
        await publicationsApi.deletePublication(item.id);
        await refreshResource("publications");
      },
    },
    sharedFiles: {
      createTitle: "파일 메타데이터 등록",
      editTitle: "파일 메타데이터 수정",
      defaults: { category: "template", minRole: "member" },
      fields: [
        { name: "title", label: "title", type: "text", required: true },
        { name: "description", label: "description", type: "textarea" },
        { name: "category", label: "category", type: "select", options: ["paper", "presentation", "template", "software", "other"] },
        { name: "minRole", label: "minRole", type: "select", options: ["member", "manager", "admin"] },
        { name: "filename", label: "filename", type: "text", required: true },
        { name: "mimeType", label: "mimeType", type: "text" },
        { name: "fileUrl", label: "fileUrl", type: "url", required: true },
        { name: "filesize", label: "filesize", type: "number" },
      ],
      toForm: fileToForm,
      create: async (values) => {
        await filesApi.createFile(values);
        await refreshResource("sharedFiles");
      },
      update: async (item, values) => {
        await filesApi.updateFile(item.id, values);
        await refreshResource("sharedFiles");
      },
      delete: async (item) => {
        await filesApi.deleteFile(item.id);
        await refreshResource("sharedFiles");
      },
    },
    purchaseRequests: {
      createTitle: "구매 신청",
      defaults: { quantity: 1, estimatedPrice: 0 },
      fields: [
        { name: "itemName", label: "itemName", type: "text", required: true },
        { name: "quantity", label: "quantity", type: "number", required: true },
        { name: "estimatedPrice", label: "estimatedPrice", type: "number", required: true },
        { name: "purchaseUrl", label: "purchaseUrl", type: "url" },
        { name: "reason", label: "reason", type: "textarea", required: true },
      ],
      create: async (values) => {
        const data = await procurementApi.requestProcurement(values);
        const row = data?.request ? { ...data.request, sessionOnly: true } : { ...data, sessionOnly: true };
        updateCollection("purchaseRequests", (items) => [row, ...items]);
      },
    },
    expenses: {
      createTitle: "지출 신청",
      defaults: { category: "material", date: todayISO(), receiptStorageType: "drive" },
      fields: [
        { name: "budgetId", label: "budgetId", type: "number", required: true },
        { name: "category", label: "category", type: "select", options: ["personnel", "activity", "material", "other"] },
        { name: "itemName", label: "itemName", type: "text", required: true },
        { name: "amount", label: "amount", type: "number", required: true },
        { name: "date", label: "date", type: "date", required: true },
        { name: "receiptFilename", label: "receipt filename", type: "text" },
        { name: "receiptStorageType", label: "receipt storageType", type: "select", options: ["drive", "nas"] },
        { name: "receiptFileUrl", label: "receipt fileUrl", type: "url" },
        { name: "receiptFilepath", label: "receipt filepath", type: "text" },
      ],
      create: async (values) => {
        const data = await budgetApi.requestExpense(values);
        const row = data?.expense ? { ...data.expense, receipt: data.receipt, sessionOnly: true } : { ...data, sessionOnly: true };
        updateCollection("expenses", (items) => [row, ...items]);
      },
    },
    sharedCredentials: {
      createTitle: "공용 계정 등록",
      editTitle: "공용 계정 수정",
      defaults: { category: "other", minRole: "member" },
      fields: [
        { name: "title", label: "title", type: "text", required: true },
        { name: "category", label: "category", type: "select", options: ["wifi", "server", "cloud", "license", "other"] },
        { name: "username", label: "username", type: "text" },
        { name: "password", label: "password", type: "password" },
        { name: "url", label: "url", type: "url" },
        { name: "memo", label: "memo", type: "textarea" },
        { name: "minRole", label: "minRole", type: "select", options: ["member", "manager", "admin"] },
      ],
      toForm: credentialToForm,
      create: async (values) => {
        await credentialsApi.createCredential(values);
        await refreshResource("sharedCredentials");
      },
      update: async (item, values) => {
        await credentialsApi.updateCredential(item.id, values);
        await refreshResource("sharedCredentials");
      },
      delete: async (item) => {
        await credentialsApi.deleteCredential(item.id);
        await refreshResource("sharedCredentials");
      },
    },
  };
}

function FormModal({ modal, onClose, onSubmit, submitting }) {
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
      description={modal.description}
      onClose={submitting ? undefined : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button type="submit" form="portal-form" variant="primary" disabled={submitting}>
            {submitting ? "처리 중" : modal.submitLabel || "저장"}
          </Button>
        </>
      }
    >
      <form id="portal-form" className="form-grid" onSubmit={handleSubmit} aria-busy={submitting}>
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
                <textarea
                  value={value}
                  rows={4}
                  required={field.required}
                  onChange={(event) => updateValue(field.name, event.target.value)}
                />
              </label>
            );
          }

          if (field.type === "select") {
            return (
              <label key={field.name} className="field">
                <span>{field.label}</span>
                <select value={value} required={field.required} onChange={(event) => updateValue(field.name, event.target.value)}>
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
              <input
                type={field.type || "text"}
                value={value}
                required={field.required}
                onChange={(event) => updateValue(field.name, event.target.value)}
              />
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
    <Modal title={detail.title} onClose={onClose} maxWidth={720}>
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

function formatNotificationTimestamp(value) {
  if (!value) return "";
  const [date, time = ""] = String(value).split("T");
  return time ? `${date} ${time.slice(0, 5)}` : date;
}

function getNotificationCategory(notification) {
  const type = notification.type || "";
  if (type.includes("leave")) return { label: "휴가", tone: "leave" };
  if (type.includes("purchase")) return { label: "구매", tone: "purchase" };
  if (type.includes("notice")) return { label: "공지", tone: "file" };
  if (type.includes("recruit")) return { label: "지원", tone: "purchase" };
  return { label: "운영", tone: "default" };
}

function NotificationModal({ currentUser, notifications, onClose, onMarkAllRead, onMarkRead, onSend }) {
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="modal-backdrop notification-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal notification-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="notification-modal-header">
          <div className="notification-title-row">
            <h2 id="notification-modal-title">알림</h2>
            <span className="notification-count" aria-label={`알림 ${notifications.length}개`}>
              {notifications.length}
            </span>
          </div>
          <div className="notification-header-actions">
            {hasRole(currentUser, "manager") ? (
              <Button size="sm" variant="secondary" onClick={onSend}>
                알림 전송
              </Button>
            ) : null}
            <Button size="sm" variant="secondary" onClick={onMarkAllRead} disabled={!unreadCount}>
              모두 읽음
            </Button>
            <button type="button" className="notification-close-button" aria-label="알림 닫기" onClick={onClose}>
              X
            </button>
          </div>
        </header>

        <div className="notification-modal-body">
          {notifications.length ? (
            <div className="notification-list">
              {notifications.map((notification) => {
                const category = getNotificationCategory(notification);
                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={`notification-item notification-button ${notification.read ? "notification-read" : "notification-unread"}`}
                    onClick={() => onMarkRead(notification)}
                  >
                    <span className="notification-unread-dot" aria-hidden="true" />
                    <span className="notification-item-content">
                      <span className="notification-meta">
                        <span className={`notification-category notification-category-${category.tone}`}>{category.label}</span>
                        <time dateTime={notification.created_at}>{formatNotificationTimestamp(notification.created_at)}</time>
                      </span>
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="notification-empty">
              <strong>새 알림이 없습니다.</strong>
              <p>읽을 수 있는 알림이 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AppIntegrated() {
  const auth = useAuth();
  const [activePage, setActivePage] = useState(() => (window.location.pathname === "/apply" ? "apply" : "dashboard"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [data, setData] = useState(initialData);
  const [resourceState, setResourceState] = useState({});
  const [formModal, setFormModal] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);

  const currentUser = auth.user;
  const activeMeta = pageRegistry[activePage] || pageRegistry.dashboard;
  const ActivePage = activeMeta.component;

  const showToast = useCallback((message, type = "info") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const updateCollection = useCallback((key, updater) => {
    setData((current) => ({
      ...current,
      [key]: typeof updater === "function" ? updater(current[key] || []) : updater,
    }));
  }, []);

  const setResourceLoading = useCallback((key, patch) => {
    setResourceState((current) => ({
      ...current,
      [key]: { ...(current[key] || {}), ...patch },
    }));
  }, []);

  const loadResource = useCallback(
    async (key, options = {}) => {
      if (auth.isPreview) {
        setResourceLoading(key, { loading: false, error: "미리보기 모드에서는 서버 데이터를 불러오지 않습니다." });
        return undefined;
      }
      setResourceLoading(key, { loading: true, error: "" });
      try {
        let value;
        if (key === "notices") value = await noticesApi.listNotices({}, options);
        if (key === "calendarEvents") value = await calendarApi.listEvents(calendarRange(), options);
        if (key === "publications") value = await publicationsApi.listPublications({}, options);
        if (key === "sharedFiles") value = await filesApi.listFiles({}, options);
        if (key === "sharedCredentials") value = await credentialsApi.listCredentials({}, options);
        if (key === "notifications") value = await notificationsApi.listNotifications({}, options);
        if (key === "applications") value = hasRole(currentUser, "manager") ? await applicationsApi.listApplications({}, options) : [];
        if (key === "adminDashboard") value = hasRole(currentUser, "manager") ? await usersApi.getAdminDashboard(options) : null;
        if (value !== undefined) setData((current) => ({ ...current, [key]: value }));
        setResourceLoading(key, { loading: false, error: "" });
        return value;
      } catch (error) {
        if (error.name === "AbortError") return undefined;
        setResourceLoading(key, { loading: false, error: error.message || "조회에 실패했습니다." });
        return undefined;
      }
    },
    [auth.isPreview, currentUser, setResourceLoading],
  );

  const refreshResource = useCallback((key) => loadResource(key), [loadResource]);

  useEffect(() => {
    if (!auth.authReady || !auth.isAuthenticated || !currentUser || auth.isPreview) return undefined;
    const controller = new AbortController();
    setData((current) => ({
      ...current,
      applications: hasRole(currentUser, "manager") ? current.applications : [],
      adminDashboard: null,
    }));
    const keys = [...readableResources, "adminDashboard"];
    if (hasRole(currentUser, "manager")) keys.push("applications");
    keys.forEach((key) => loadResource(key, { signal: controller.signal }));
    return () => controller.abort();
  }, [auth.authReady, auth.isAuthenticated, auth.isPreview, currentUser, loadResource]);

  const resourceConfigs = useMemo(
    () =>
      buildResourceConfigs({
        refreshResource,
        updateCollection,
      }),
    [refreshResource, updateCollection],
  );

  const navigate = useCallback((page) => {
    setActivePage(page === "login" ? "dashboard" : page);
    setSidebarOpen(false);
    if (page === "apply") {
      window.history.pushState(null, "", "/apply");
    } else if (window.location.pathname === "/apply") {
      window.history.pushState(null, "", "/");
    }
  }, []);

  const openCreate = useCallback(
    (key, overrides = {}) => {
      if (auth.isPreview) {
        showToast("미리보기 모드에서는 데이터를 등록할 수 없습니다.", "warning");
        return;
      }
      const config = resourceConfigs[key];
      if (!config) {
        showToast("이번 MVP에서 지원하지 않는 생성 기능입니다.", "warning");
        return;
      }
      if (!hasRole(currentUser, config.minRole || "member")) {
        showToast("권한이 없습니다.", "warning");
        return;
      }
      setFormModal({
        title: config.createTitle,
        fields: config.fields,
        initialValues: { ...config.defaults, ...overrides },
        submitLabel: config.submitCreate || "등록",
        successMessage: `${config.createTitle}이 완료되었습니다.`,
        onSubmit: config.create,
      });
    },
    [auth.isPreview, currentUser, resourceConfigs, showToast],
  );

  const openEdit = useCallback(
    (key, item) => {
      if (auth.isPreview) {
        showToast("미리보기 모드에서는 데이터를 수정할 수 없습니다.", "warning");
        return;
      }
      const config = resourceConfigs[key];
      if (!config?.update) {
        showToast("이번 MVP에서 수정 API가 제공되지 않습니다.", "warning");
        return;
      }
      setFormModal({
        title: config.editTitle || "수정",
        fields: config.fields,
        initialValues: config.toForm ? config.toForm(item) : item,
        submitLabel: "저장",
        successMessage: `${config.editTitle || "수정"}이 완료되었습니다.`,
        onSubmit: (values) => config.update(item, values),
      });
    },
    [auth.isPreview, resourceConfigs, showToast],
  );

  const openForm = useCallback((modal) => {
    if (auth.isPreview) {
      showToast("미리보기 모드에서는 처리 작업을 실행할 수 없습니다.", "warning");
      return;
    }
    setFormModal(modal);
  }, [auth.isPreview, showToast]);

  const deleteItem = useCallback(
    (key, item, label) => {
      if (auth.isPreview) {
        showToast("미리보기 모드에서는 데이터를 삭제할 수 없습니다.", "warning");
        return;
      }
      const config = resourceConfigs[key];
      if (!config?.delete) {
        showToast("이번 MVP에서 삭제 API가 제공되지 않습니다.", "warning");
        return;
      }
      setConfirmModal({
        title: "삭제 확인",
        message: `${label} 데이터를 삭제할까요?`,
        confirmLabel: "삭제",
        onConfirm: async () => {
          try {
            await config.delete(item);
            setConfirmModal(null);
            showToast(`${label} 데이터가 삭제되었습니다.`);
          } catch (error) {
            showToast(error.message || "삭제에 실패했습니다.", "warning");
          }
        },
      });
    },
    [auth.isPreview, resourceConfigs, showToast],
  );

  const submitForm = async (values) => {
    setFormSubmitting(true);
    try {
      await formModal.onSubmit(values);
      showToast(formModal.successMessage || "저장되었습니다.");
      setFormModal(null);
    } catch (error) {
      showToast(error.message || "요청 처리에 실패했습니다.", "warning");
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDetail = useCallback((title, content) => {
    setDetailModal({ title, content });
  }, []);

  const copyText = useCallback(
    async (text, message = "복사되었습니다.") => {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(text || ""));
      }
      showToast(message);
    },
    [showToast],
  );

  const downloadFile = useCallback(
    async (file) => {
      try {
        const result = await filesApi.downloadFile(file.id);
        await refreshResource("sharedFiles");
        if (result?.file_url) {
          window.open(result.file_url, "_blank", "noopener,noreferrer");
          showToast(`${result.filename || file.filename} 다운로드 링크를 열었습니다.`);
        } else {
          showToast("다운로드 링크가 응답에 포함되지 않았습니다.", "warning");
        }
      } catch (error) {
        showToast(error.message || "다운로드 요청에 실패했습니다.", "warning");
      }
    },
    [refreshResource, showToast],
  );

  const checkAttendance = useCallback(
    async (type) => {
      if (auth.isPreview) {
        showToast("미리보기 모드에서는 출결을 처리할 수 없습니다.", "warning");
        return;
      }
      try {
        const result = type === "in" ? await attendanceApi.checkIn() : await attendanceApi.checkOut();
        const row = result?.attendance ? { ...result.attendance, sessionOnly: true } : { ...result, sessionOnly: true };
        updateCollection("attendanceRecords", (items) => [row, ...items.filter((item) => item.id !== row.id)]);
        showToast(type === "in" ? "출근 처리되었습니다." : "퇴근 처리되었습니다.");
      } catch (error) {
        showToast(error.message || "출결 처리에 실패했습니다.", "warning");
      }
    },
    [auth.isPreview, showToast, updateCollection],
  );

  const openCalendarException = useCallback(
    (event) => {
      openForm({
        title: "반복 회차 예외",
        description: "백엔드 createException API로 특정 반복 회차를 취소하거나 변경합니다.",
        fields: [
          { name: "originalDate", label: "originalDate", type: "date", required: true },
          { name: "isCancelled", label: "isCancelled", type: "checkbox" },
          { name: "newStart", label: "newStart", type: "datetime-local" },
          { name: "newEnd", label: "newEnd", type: "datetime-local" },
          { name: "newTitle", label: "newTitle", type: "text" },
        ],
        initialValues: { originalDate: todayISO(), isCancelled: true },
        submitLabel: "예외 저장",
        successMessage: "반복 회차 예외가 저장되었습니다.",
        onSubmit: async (values) => {
          await calendarApi.createException(event.id, values);
          await refreshResource("calendarEvents");
        },
      });
    },
    [openForm, refreshResource],
  );

  const openCalendarSplit = useCallback(
    (event) => {
      openForm({
        title: "반복 일정 분리",
        description: "백엔드 split API로 this-and-future 변경을 수행합니다.",
        fields: [
          { name: "untilDatetime", label: "untilDatetime", type: "datetime-local", required: true },
          { name: "startDatetime", label: "startDatetime", type: "datetime-local", required: true },
          { name: "endDatetime", label: "endDatetime", type: "datetime-local", required: true },
          { name: "title", label: "title", type: "text" },
          { name: "description", label: "description", type: "textarea" },
          { name: "location", label: "location", type: "text" },
          { name: "isAllDay", label: "isAllDay", type: "checkbox" },
          { name: "recurrenceRule", label: "recurrenceRule", type: "text" },
        ],
        initialValues: {
          untilDatetime: String(event.start_datetime || "").slice(0, 16),
          startDatetime: String(event.start_datetime || "").slice(0, 16),
          endDatetime: String(event.end_datetime || "").slice(0, 16),
          title: event.title,
          recurrenceRule: event.recurrence_rule || "",
        },
        submitLabel: "분리",
        successMessage: "반복 일정이 분리되었습니다.",
        onSubmit: async (values) => {
          await calendarApi.splitRecurrence(event.id, values);
          await refreshResource("calendarEvents");
        },
      });
    },
    [openForm, refreshResource],
  );

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead();
      await refreshResource("notifications");
      showToast("모든 알림을 읽음 처리했습니다.");
    } catch (error) {
      showToast(error.message || "알림 읽음 처리에 실패했습니다.", "warning");
    }
  }, [refreshResource, showToast]);

  const markNotificationRead = useCallback(
    async (notification) => {
      try {
        if (!notification.read) {
          await notificationsApi.markRead(notification.id);
          await refreshResource("notifications");
        }
        const target = notification.related_type || notification.relatedType;
        const pageMap = {
          notice: "notices",
          notices: "notices",
          leave: "leave",
          procurement: "purchases",
          purchase: "purchases",
          recruit: "admin",
          application: "admin",
        };
        if (pageMap[target]) navigate(pageMap[target]);
      } catch (error) {
        showToast(error.message || "알림 처리에 실패했습니다.", "warning");
      }
    },
    [navigate, refreshResource, showToast],
  );

  const openNotificationSend = useCallback(() => {
    openForm({
      title: "알림 전송",
      fields: [
        { name: "userId", label: "userId", type: "number", required: true },
        {
          name: "type",
          label: "type",
          type: "select",
          options: [
            "general",
            "leave_requested",
            "leave_approved",
            "leave_rejected",
            "purchase_requested",
            "purchase_approved",
            "purchase_rejected",
            "purchase_delivered",
            "notice_created",
            "recruit_received",
          ],
        },
        { name: "title", label: "title", type: "text", required: true },
        { name: "message", label: "message", type: "textarea", required: true },
        { name: "relatedType", label: "relatedType", type: "text" },
        { name: "relatedId", label: "relatedId", type: "number" },
      ],
      initialValues: { type: "general" },
      submitLabel: "전송",
      successMessage: "알림을 전송했습니다.",
      onSubmit: notificationsApi.createNotification,
    });
  }, [openForm]);

  const requestPasswordReset = useCallback(() => {
    openForm({
      title: "비밀번호 재설정 요청",
      fields: [{ name: "email", label: "email", type: "email", required: true }],
      initialValues: { email: currentUser?.email || "" },
      submitLabel: "요청",
      successMessage: "비밀번호 재설정 요청이 접수되었습니다.",
      onSubmit: (values) => auth.requestPasswordReset(values.email),
    });
  }, [auth, currentUser, openForm]);

  const actions = {
    openCreate,
    openEdit,
    openForm,
    openDetail,
    deleteItem,
    updateCollection,
    showToast,
    downloadFile,
    copyText,
    canAccess: (item) => canAccess(currentUser, item),
    refreshResource,
    checkAttendance,
    openCalendarException,
    openCalendarSplit,
    openNotificationSend,
    requestPasswordReset,
    api: {
      noticesApi,
      publicationsApi,
      filesApi,
      budgetApi,
      procurementApi,
      credentialsApi,
      applicationsApi,
      notificationsApi,
    },
  };

  if (activePage === "apply") {
    return (
      <>
        <ApplyPage onBack={() => navigate(auth.isAuthenticated ? "dashboard" : "login")} showToast={showToast} />
        <Toast toast={toast} />
      </>
    );
  }

  return (
    <ProtectedRoute
      isReady={auth.authReady}
      isAllowed={auth.isAuthenticated}
      fallback={<AuthPage auth={auth} onApply={() => navigate("apply")} onSuccess={() => navigate("dashboard")} showToast={showToast} />}
    >
      <div className={`app-shell ${auth.isPreview ? "preview-mode" : ""}`}>
        <Sidebar
          activePage={activePage}
          currentUser={currentUser}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={navigate}
          unreadCount={data.notifications.filter((item) => !normalizeNotification(item).read).length}
          onLogout={auth.logout}
        />

        <main className="main-shell">
          <Header
            title={activeMeta.title}
            description={activeMeta.description}
            unreadCount={data.notifications.filter((item) => !normalizeNotification(item).read).length}
            onMenuClick={() => setSidebarOpen(true)}
            onShowNotifications={() => setNotificationModalOpen(true)}
            onProfileClick={() => navigate("mypage")}
          />
          {auth.isPreview ? (
            <div className="preview-banner" role="status">
              <div>
                <strong>UI 미리보기 모드</strong>
                <span>백엔드에 연결하지 않으며, 데이터 생성·수정·삭제 결과는 저장되지 않습니다.</span>
              </div>
              <Button size="sm" variant="secondary" onClick={auth.logout}>미리보기 종료</Button>
            </div>
          ) : null}
          <div className="content-area">
            {!auth.authReady ? (
              <LoadingState />
            ) : (
              <ActivePage
                data={{ ...data, notices: data.notices.map(normalizeNotice), notifications: data.notifications.map(normalizeNotification) }}
                resourceState={resourceState}
                currentUser={currentUser}
                actions={actions}
                globalSearch={globalSearch}
              />
            )}
          </div>
        </main>

        {formModal ? (
          <FormModal modal={formModal} onClose={() => setFormModal(null)} onSubmit={submitForm} submitting={formSubmitting} />
        ) : null}
        {detailModal ? <DetailModal detail={detailModal} onClose={() => setDetailModal(null)} /> : null}
        {notificationModalOpen ? (
          <NotificationModal
            currentUser={currentUser}
            notifications={data.notifications.map(normalizeNotification)}
            onClose={() => setNotificationModalOpen(false)}
            onMarkAllRead={markAllNotificationsRead}
            onMarkRead={markNotificationRead}
            onSend={openNotificationSend}
          />
        ) : null}
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
    </ProtectedRoute>
  );
}
