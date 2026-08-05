import { useEffect, useMemo, useState } from "react";
import { clearAuthSession, logoutUser, readAuthSession, saveAuthSession } from "./api/auth.js";
import {
  advancePurchase,
  changeMyPassword,
  changeUserRole,
  changeUserStatus,
  checkAttendance,
  createCalendarException,
  createExpense,
  createLeave,
  createNotice,
  createNotification,
  createPurchase,
  createResource,
  deleteResource,
  getFileDownload,
  getBudgets,
  getExpenses,
  getCalendarEvents,
  getLeaveBalance,
  getNotice,
  getUserLeaveBalance,
  getPublication,
  loadPortalData,
  logCredentialCopy,
  markAllNotificationsRead,
  markNotificationRead,
  normalizeAttendanceRecord,
  normalizeResource,
  patchAttendanceRecord,
  revealCredential,
  reviewExpense,
  reviewLeave,
  reviewPurchase,
  setNoticePinned,
  splitCalendarRecurrence,
  updateResource,
  updateMyProfile,
  uploadFileToStorage,
} from "./api/portal.js";
import Button from "./components/Button.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import Header from "./components/Header.jsx";
import Modal from "./components/Modal.jsx";
import NotificationCenterModal from "./components/NotificationCenterModal.jsx";
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
import { todayISO } from "./utils/format.js";
import { canAccess, hasRole } from "./utils/permissions.js";

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
  users: [],
  notices: [],
  calendarEvents: [],
  attendanceRecords: [],
  leaveBalances: [],
  leaveRequests: [],
  researchProjects: [],
  publications: [],
  sharedFiles: [],
  purchaseRequests: [],
  budgets: [],
  expenses: [],
  sharedCredentials: [],
  notifications: [],
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
      defaults: { category: "general", is_pinned: false },
      fields: [
        { name: "title", label: "title", type: "text" },
        {
          name: "category",
          label: "category",
          type: "select",
          options: ["general", "important", "account_info", "schedule"],
        },
        { name: "content", label: "content", type: "textarea" },
        {
          name: "attachment_files",
          label: "첨부파일",
          type: "file",
          multiple: true,
          help: "선택한 파일은 Supabase Storage에 업로드된 뒤 공지 첨부로 저장됩니다.",
        },
        { name: "is_pinned", label: "is_pinned", type: "checkbox" },
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
        { name: "leave_type", label: "leave_type", type: "select", options: ["annual", "half", "other"] },
        { name: "half_period", label: "half_period", type: "select", options: ["", "am", "pm"] },
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
      defaults: {
        status: "active",
        role: "참여",
        owner: currentUser.name,
        start_date: todayISO(),
        end_date: todayISO(),
        is_public: false,
        display_order: 0,
      },
      fields: [
        { name: "title", label: "과제명", type: "text" },
        { name: "funding_agency", label: "지원기관", type: "text" },
        { name: "program", label: "사업명", type: "text" },
        { name: "start_date", label: "시작일", type: "date" },
        { name: "end_date", label: "종료일", type: "date" },
        { name: "owner", label: "담당자", type: "text" },
        { name: "role", label: "역할", type: "text" },
        { name: "status", label: "상태", type: "text" },
        { name: "is_public", label: "공개 홈페이지 노출", type: "checkbox" },
        { name: "display_order", label: "표시 순서", type: "number" },
      ],
      create: (values) => ({ id: uid("project"), ...values, owner: currentUser.name }),
    },
    publications: {
      createTitle: "논문 등록",
      editTitle: "논문 수정",
      defaults: { year: String(new Date().getFullYear()), pub_type: "intl_conf", status: "writing", is_public: false, author_user_ids: [] },
      fields: [
        { name: "title", label: "title", type: "text" },
        { name: "authors_text", label: "authors_text", type: "text" },
        {
          name: "author_user_ids",
          label: "내부 저자 연결",
          type: "multiselect",
          options: data.users
            .filter((user) => user.account_status === "approved")
            .map((user) => option(user.id, `${user.name} · ${user.email}`)),
          help: "선택한 순서대로 내부 저자가 연결됩니다.",
        },
        { name: "year", label: "year", type: "text" },
        { name: "published_date", label: "published_date", type: "date" },
        { name: "pub_type", label: "pub_type", type: "select", options: ["sci", "kci", "intl_conf", "domestic_conf"] },
        { name: "status", label: "status", type: "select", options: ["writing", "submitted", "under_review", "accepted", "published"] },
        { name: "venue", label: "venue", type: "text" },
        { name: "doi", label: "doi", type: "text" },
        {
          name: "attachment_files",
          label: "논문 첨부파일",
          type: "file",
          multiple: true,
          help: "원문·증빙 파일 업로드 UI입니다. 저장소 API 연결 후 활성화됩니다.",
        },
        { name: "is_public", label: "is_public", type: "checkbox" },
      ],
      create: (values) => ({ id: uid("pub"), ...values }),
    },
    sharedFiles: {
      createTitle: "파일 업로드",
      editTitle: "버전 업데이트",
      defaults: { category: "template", min_role: "member" },
      fields: [
        {
          name: "shared_file",
          label: "업로드 파일",
          type: "file",
          multiple: false,
          help: "파일을 선택하면 Supabase Storage 업로드 후 아래 파일 정보가 자동으로 채워집니다.",
        },
        { name: "title", label: "title", type: "text" },
        { name: "description", label: "description", type: "textarea" },
        { name: "category", label: "category", type: "select", options: ["paper", "presentation", "template", "software", "other"] },
        { name: "min_role", label: "min_role", type: "select", options: ["member", "manager", "admin"] },
        { name: "filename", label: "filename", type: "text" },
        { name: "file_url", label: "file_url", type: "url" },
        { name: "mime_type", label: "mime_type", type: "text" },
        { name: "filesize", label: "filesize", type: "number" },
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
      defaults: {
        fund_type: "research",
        project_id: "",
        total_budget: 0,
        start_date: todayISO(),
        end_date: todayISO(),
        status: "active",
      },
      fields: [
        { name: "name", label: "예산명", type: "text" },
        { name: "fund_type", label: "재원 구분", type: "select", options: ["department", "research", "other"] },
        {
          name: "project_id",
          label: "연구과제 (선택)",
          type: "select",
          options: [option("", "연결 안 함"), ...data.researchProjects.map((project) => option(project.id, project.title))],
        },
        { name: "total_budget", label: "총 예산액", type: "number" },
        { name: "start_date", label: "시작일", type: "date" },
        { name: "end_date", label: "종료일", type: "date" },
        { name: "status", label: "상태", type: "select", options: ["active", "completed", "pending"] },
      ],
      create: (values) => ({ id: uid("budget"), ...values, used_amount: 0 }),
    },
    expenses: {
      createTitle: "지출 등록",
      editTitle: "지출 수정",
      defaults: { budget_id: data.budgets[0]?.id || "", category: "material", amount: 0, date: todayISO(), status: "pending" },
      fields: [
        {
          name: "budget_id",
          label: "예산 장부",
          type: "select",
          options: data.budgets.map((budget) => option(budget.id, budget.name)),
        },
        { name: "category", label: "category", type: "select", options: ["personnel", "activity", "material", "other"] },
        { name: "item_name", label: "item_name", type: "text" },
        { name: "amount", label: "amount", type: "number" },
        { name: "date", label: "date", type: "date" },
        {
          name: "receipt_files",
          label: "영수증",
          type: "file",
          multiple: false,
          accept: "image/*,.pdf",
          help: "선택한 이미지 또는 PDF가 업로드된 뒤 지출 영수증으로 저장됩니다.",
        },
      ],
      create: (values) => ({ id: uid("expense"), ...values, status: "pending", receipt: "" }),
    },
    sharedCredentials: {
      createTitle: "공용 계정 등록",
      editTitle: "공용 계정 수정",
      defaults: { category: "other", min_role: "member" },
      fields: [
        { name: "title", label: "title", type: "text" },
        { name: "category", label: "category", type: "select", options: ["wifi", "server", "cloud", "license", "other"] },
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

async function prepareResourceValues(key, values) {
  if (key === "publications" && values.attachment_files?.length) {
    throw new Error("논문 첨부파일 저장 API가 아직 제공되지 않습니다. 첨부 선택을 해제해 주세요.");
  }
  if (key === "notices" && values.attachment_files?.length) {
    const attachments = await Promise.all(values.attachment_files.map((item) => uploadFileToStorage(item.file, "notices")));
    return { ...values, attachments };
  }
  if (key === "expenses" && values.receipt_files?.length) {
    const receipt = await uploadFileToStorage(values.receipt_files[0].file, "receipts");
    return { ...values, receipt };
  }
  if (key === "sharedFiles" && values.shared_file?.length) {
    const uploaded = await uploadFileToStorage(values.shared_file[0].file, "misc");
    return {
      ...values,
      filename: uploaded.filename,
      mime_type: uploaded.mimeType,
      file_url: uploaded.fileUrl,
      filesize: uploaded.filesize,
    };
  }
  return values;
}

function FormModal({ modal, onClose, onSubmit, submitting = false }) {
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
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button type="submit" form="portal-form" variant="primary" disabled={submitting}>
            {submitting ? "처리 중..." : modal.submitLabel || "저장"}
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

          if (field.type === "file") {
            const files = Array.isArray(value) ? value : [];
            return (
              <div key={field.name} className="field file-draft-field">
                <span>{field.label}</span>
                <input
                  key={files.map((file) => file.filename).join("|") || "empty"}
                  type="file"
                  multiple={field.multiple}
                  accept={field.accept}
                  onChange={(event) => updateValue(field.name, Array.from(event.target.files || []).map((file) => ({
                    file,
                    filename: file.name,
                    mime_type: file.type,
                    filesize: file.size,
                  })))}
                />
                {files.length ? (
                  <div className="file-draft-summary">
                    <ul className="file-draft-list">
                      {files.map((file) => <li key={`${file.filename}-${file.filesize}`}>{file.filename}</li>)}
                    </ul>
                    <Button size="sm" variant="ghost" onClick={() => updateValue(field.name, [])}>선택 해제</Button>
                  </div>
                ) : null}
                {field.help ? <small className="field-help">{field.help}</small> : null}
              </div>
            );
          }

          if (field.type === "multiselect") {
            const selected = Array.isArray(value) ? value.map(String) : [];
            return (
              <fieldset key={field.name} className="multi-select-field">
                <legend>{field.label}</legend>
                <div className="multi-select-grid">
                  {field.options.map((item) => {
                    const optionItem = typeof item === "string" ? option(item) : item;
                    const optionValue = String(optionItem.value);
                    return (
                      <label key={optionValue}>
                        <input
                          type="checkbox"
                          checked={selected.includes(optionValue)}
                          onChange={(event) => updateValue(field.name, event.target.checked
                            ? [...selected, optionValue]
                            : selected.filter((itemValue) => itemValue !== optionValue))}
                        />
                        <span>{optionItem.label || optionValue}</span>
                      </label>
                    );
                  })}
                </div>
                {field.help ? <small className="field-help">{field.help}</small> : null}
              </fieldset>
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
  const [currentUser, setCurrentUser] = useState(() => ({
    name: "사용자",
    email: "",
    role: "member",
    account_status: "approved",
    ...(readAuthSession()?.user || {}),
  }));
  const [data, setData] = useState(() => cloneData(initialData));
  const [loading, setLoading] = useState(Boolean(readAuthSession()));
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formModal, setFormModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
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
    const handleExpired = () => {
      clearAuthSession();
      setAuthSession(null);
      setData(cloneData(initialData));
      setToast({ id: Date.now(), message: "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.", type: "warning" });
    };
    window.addEventListener("aics:session-expired", handleExpired);
    return () => window.removeEventListener("aics:session-expired", handleExpired);
  }, []);

  useEffect(() => {
    if (!authSession) return undefined;
    let active = true;
    const user = { account_status: "approved", ...authSession.user };
    setCurrentUser((current) => ({ ...current, ...user }));
    setLoading(true);
    loadPortalData(user)
      .then(({ data: loadedData, errors }) => {
        if (!active) return;
        const enrichedUser = { ...user, ...loadedData.users?.[0] };
        setCurrentUser(enrichedUser);
        setData({ ...cloneData(initialData), ...loadedData, users: [enrichedUser, ...(loadedData.users || []).slice(1)] });
        if (errors.length) {
          setToast({
            id: Date.now(),
            message: `일부 데이터를 불러오지 못했습니다: ${errors.map(({ key }) => key).join(", ")}`,
            type: "warning",
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authSession]);

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

  const replaceItem = (key, id, value) => {
    updateCollection(key, (items) => items.map((item) => (item.id === id ? { ...item, ...value } : item)));
  };

  const refreshBudgetData = async () => {
    const [budgets, expenses] = await Promise.all([getBudgets(), getExpenses()]);
    setData((current) => ({ ...current, budgets, expenses }));
  };

  const refreshCalendarData = async () => {
    updateCollection("calendarEvents", await getCalendarEvents());
  };

  const openCreate = (key, overrides = {}) => {
    if (key === "notices" && !hasRole(currentUser, "manager")) {
      showToast("공지 등록은 관리자만 사용할 수 있습니다.", "warning");
      return;
    }
    if (key === "expenses" && !data.budgets.length) {
      showToast("지출을 등록하려면 먼저 예산 장부를 등록해 주세요.", "warning");
      return;
    }
    const config = resourceConfigs[key];
    if (!config) {
      showToast("해당 기능은 백엔드 API가 아직 제공되지 않습니다.", "warning");
      return;
    }
    setFormModal({
      title: config.createTitle,
      fields: config.fields,
      initialValues: { ...config.defaults, ...overrides },
      submitLabel: config.submitCreate || "등록",
      successMessage: `${config.createTitle}이 완료되었습니다.`,
      onSubmit: async (values) => {
        const preparedValues = await prepareResourceValues(key, values);
        let created;
        if (key === "notices") created = await createNotice(preparedValues);
        else if (key === "leaveRequests") created = await createLeave(preparedValues);
        else if (key === "purchaseRequests") created = await createPurchase(preparedValues);
        else if (key === "expenses") created = await createExpense(preparedValues);
        else created = await createResource(key, preparedValues);

        const normalized = normalizeResource(key, {
          ...created,
          author: created?.author || currentUser.name,
          user_name: created?.user_name || currentUser.name,
          requester: created?.requester || currentUser.name,
        });
        if (key === "expenses") await refreshBudgetData();
        else updateCollection(key, (items) => [normalized, ...items]);
        if (key === "leaveRequests") {
          const balance = await getLeaveBalance();
          updateCollection("leaveBalances", [balance]);
        }
      },
    });
  };

  const openEdit = (key, item) => {
    const config = resourceConfigs[key];
    if (!config) return;
    const fields = key === "notices" ? config.fields.filter((field) => field.name !== "attachment_files") : config.fields;
    const initialValues = key === "publications"
      ? { ...item, author_user_ids: item.authors?.map((author) => author.user_id ?? author.userId) || [] }
      : item;
    setFormModal({
      title: config.editTitle,
      fields,
      initialValues,
      submitLabel: config.submitEdit || "저장",
      successMessage: `${config.editTitle}이 완료되었습니다.`,
      onSubmit: async (values) => {
        const preparedValues = await prepareResourceValues(key, values);
        const updated = normalizeResource(key, await updateResource(key, item.id, preparedValues));
        if (key === "budgets") updated.used_amount = item.used_amount;
        replaceItem(key, item.id, updated);
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
      onConfirm: async () => {
        try {
          await deleteResource(key, id);
          updateCollection(key, (items) => items.filter((item) => item.id !== id));
          setConfirmModal(null);
          showToast(`${label} 데이터가 삭제되었습니다.`);
          if (key === "leaveRequests") {
            getLeaveBalance()
              .then((balance) => updateCollection("leaveBalances", [balance]))
              .catch(() => showToast("휴가 신청은 삭제되었지만 잔여일 갱신에 실패했습니다.", "warning"));
          }

          if (key === "researchProjects") {
            updateCollection("budgets", (items) => items.map((budget) => (
              Number(budget.project_id) === Number(id) ? { ...budget, project_id: null } : budget
            )));
          }
        } catch (error) {
          showToast(error.message, "error");
        }
      },
    });
  };

  const openDetail = (title, content) => {
    setDetailModal({ title, content });
  };

  const downloadFile = async (file) => {
    if (!canAccess(currentUser, file)) {
      showToast("접근 권한이 없습니다.", "warning");
      return;
    }
    try {
      const download = await getFileDownload(file.id);
      replaceItem("sharedFiles", file.id, { download_count: download.download_count });
      window.open(download.file_url, "_blank", "noopener,noreferrer");
      showToast(`${download.filename} 다운로드 링크를 열었습니다.`);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const openNoticeEdit = async (notice) => {
    try {
      const detail = await getNotice(notice.id);
      replaceItem("notices", notice.id, detail);
      openEdit("notices", { ...notice, ...detail });
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const copyText = (text, message = "복사되었습니다.") => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast(message);
  };

  const persistCurrentUser = (updated) => {
    const nextUser = { ...currentUser, ...updated };
    setCurrentUser(nextUser);
    updateCollection("users", (items) => items.map((user) => (
      Number(user.id) === Number(nextUser.id) ? { ...user, ...nextUser } : user
    )));
    const session = readAuthSession();
    if (session) saveAuthSession({ ...session, user: { ...session.user, ...updated } });
  };

  const updateCurrentUser = () => {
    setFormModal({
      title: "프로필 수정",
      fields: [
        { name: "name", label: "이름", type: "text" },
        { name: "department", label: "소속", type: "text" },
        { name: "program", label: "과정", type: "select", options: ["undergrad", "master", "phd", "professor", "other"] },
        { name: "enrollment_year", label: "입학 연도", type: "text" },
        { name: "research_topic", label: "연구 주제", type: "textarea" },
        { name: "phone", label: "연락처", type: "text" },
        { name: "bio", label: "소개", type: "textarea" },
        { name: "github_url", label: "GitHub URL", type: "url" },
        { name: "linkedin_url", label: "LinkedIn URL", type: "url" },
        {
          name: "profile_image_file",
          label: "프로필 이미지 업로드",
          type: "file",
          multiple: false,
          accept: "image/*",
          help: "이미지를 선택하면 Supabase Storage에 업로드한 뒤 프로필 URL을 갱신합니다.",
        },
        { name: "profile_image", label: "프로필 이미지 URL", type: "url" },
        { name: "is_public", label: "공개 프로필 노출", type: "checkbox" },
        { name: "preferred_language", label: "언어", type: "select", options: ["ko", "en"] },
      ],
      initialValues: {
        ...currentUser,
        program: currentUser.program || "other",
        preferred_language: currentUser.preferred_language || "ko",
      },
      submitLabel: "저장",
      successMessage: "프로필이 수정되었습니다.",
      onSubmit: async (values) => {
        let preparedValues = values;
        if (values.profile_image_file?.length) {
          const uploaded = await uploadFileToStorage(values.profile_image_file[0].file, "profiles");
          preparedValues = { ...values, profile_image: uploaded.fileUrl };
        }
        persistCurrentUser(await updateMyProfile(preparedValues));
      },
    });
  };

  const openPasswordChange = () => {
    setFormModal({
      title: "비밀번호 변경",
      fields: [
        { name: "current_password", label: "현재 비밀번호", type: "password" },
        { name: "new_password", label: "새 비밀번호", type: "password" },
        { name: "confirm_password", label: "새 비밀번호 확인", type: "password" },
      ],
      initialValues: { current_password: "", new_password: "", confirm_password: "" },
      submitLabel: "변경",
      successMessage: "비밀번호가 변경되었습니다.",
      onSubmit: async (values) => {
        if (values.new_password !== values.confirm_password) throw new Error("새 비밀번호 확인이 일치하지 않습니다.");
        await changeMyPassword(values.current_password, values.new_password);
      },
    });
  };

  const markNotificationsRead = async () => {
    try {
      if (data.notifications.some((notification) => !notification.read)) {
        await markAllNotificationsRead();
        updateCollection("notifications", (items) => items.map((item) => ({ ...item, read: true, is_read: true })));
      }
      showToast("모든 알림을 읽음 처리했습니다.");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const markSingleNotificationRead = async (id) => {
    const updated = await markNotificationRead(id);
    replaceItem("notifications", id, updated);
    showToast("알림을 읽음 처리했습니다.");
    return updated;
  };

  const sendNotification = async (values) => {
    const created = await createNotification(values);
    if (Number(created.user_id) === Number(currentUser.id)) {
      updateCollection("notifications", (items) => [created, ...items]);
    }
    showToast("알림을 발송했습니다.");
    return created;
  };

  const saveCalendarException = async (eventId, values) => {
    const result = await createCalendarException(eventId, values);
    await refreshCalendarData();
    showToast(values.isCancelled ? "해당 회차를 취소했습니다." : "해당 회차를 변경했습니다.");
    return result;
  };

  const saveCalendarSplit = async (eventId, values) => {
    const result = await splitCalendarRecurrence(eventId, values);
    await refreshCalendarData();
    showToast("이후 일정을 새 반복 시리즈로 분리했습니다.");
    return result;
  };

  const queryUserLeaveBalance = (userId, year) => getUserLeaveBalance(userId, year);

  const showNotifications = () => setNotificationCenterOpen(true);

  const submitForm = async (values) => {
    setFormSubmitting(true);
    try {
      await formModal.onSubmit(values);
      showToast(formModal.successMessage || "저장되었습니다.");
      setFormModal(null);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const updateItem = async (key, id, patch) => {
    try {
      const item = data[key]?.find((current) => current.id === id);
      if (!item) throw new Error("대상 데이터를 찾을 수 없습니다.");

      let updated;
      if (key === "publications") {
        updated = normalizeResource(key, await updateResource(key, id, { ...item, ...patch }));
      } else if (key === "notices" && typeof patch.is_pinned === "boolean") {
        updated = normalizeResource(key, await setNoticePinned(id, patch.is_pinned));
      } else if (key === "purchaseRequests" && ["approved", "rejected"].includes(patch.status)) {
        updated = await reviewPurchase(id, patch.status);
      } else if (key === "purchaseRequests" && ["purchased", "delivered"].includes(patch.status)) {
        updated = await advancePurchase(id, patch.status);
      } else if (key === "leaveRequests" && ["approved", "rejected"].includes(patch.status)) {
        updated = await reviewLeave(id, patch.status);
      } else if (key === "expenses" && ["approved", "rejected"].includes(patch.status)) {
        updated = await reviewExpense(id, patch.status);
      } else if (key === "users" && patch.role) {
        updated = await changeUserRole(id, patch.role);
      } else if (key === "users" && patch.account_status) {
        updated = await changeUserStatus(id, patch.account_status);
      } else {
        throw new Error("해당 변경을 지원하는 백엔드 API가 없습니다.");
      }

      replaceItem(key, id, { ...updated, ...patch });
      if (key === "leaveRequests") {
        const balance = await getLeaveBalance();
        updateCollection("leaveBalances", [balance]);
      }
      if (key === "expenses") await refreshBudgetData();
      showToast("상태가 변경되었습니다.");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleAttendance = async (type) => {
    try {
      const record = await checkAttendance(type);
      const normalized = normalizeAttendanceRecord(record, currentUser);
      updateCollection("attendanceRecords", (items) => {
        const exists = items.some((item) => item.id === normalized.id);
        return exists ? items.map((item) => (item.id === normalized.id ? normalized : item)) : [normalized, ...items];
      });
      showToast(type === "in" ? "출근 처리되었습니다." : "퇴근 처리되었습니다.");
    } catch (error) {
      showToast(error.message, error.status === 403 ? "warning" : "error");
    }
  };

  const updateAttendance = async (record, values) => {
    const updated = normalizeAttendanceRecord(await patchAttendanceRecord(record, values), {
      id: record.user_id,
      name: record.user_name,
    });
    replaceItem("attendanceRecords", record.id, updated);
    return updated;
  };

  const openNoticeDetail = async (notice) => {
    try {
      const detail = await getNotice(notice.id);
      replaceItem("notices", notice.id, { views: detail.views, content: detail.content });
      openDetail("공지 상세", detail);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const openPublicationDetail = async (publication) => {
    try {
      const detail = normalizeResource("publications", await getPublication(publication.id));
      openDetail("논문 상세", {
        ...detail,
        authors: detail.authors?.map((author) => author.name || author.user_id).join(", ") || "-",
        attachments: detail.attachments?.map((attachment) => attachment.filename).join(", ") || "-",
      });
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const getCredentialPassword = async (credential) => {
    try {
      const revealed = await revealCredential(credential.id);
      return revealed.password;
    } catch (error) {
      showToast(error.message, "error");
      return null;
    }
  };

  const copyCredential = async (credential) => {
    const password = await getCredentialPassword(credential);
    if (!password) return;
    try {
      await logCredentialCopy(credential.id);
      await navigator.clipboard?.writeText(password);
      showToast("접근 로그가 기록되었습니다. 비밀번호가 복사되었습니다.");
    } catch (error) {
      showToast(error.message, "error");
    }
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
    openPasswordChange,
    handleAttendance,
    updateAttendance,
    saveCalendarException,
    saveCalendarSplit,
    queryUserLeaveBalance,
    openNoticeDetail,
    openNoticeEdit,
    openPublicationDetail,
    getCredentialPassword,
    copyCredential,
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
    setCurrentUser({ ...session.user, account_status: "approved" });
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    setShowRegister(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser(authSession?.refreshToken);
    } catch {
      // 서버 로그아웃이 실패해도 현재 브라우저 세션은 반드시 종료합니다.
    } finally {
      clearAuthSession();
      setAuthSession(null);
      setData(cloneData(initialData));
      setShowRegister(false);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
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
          {loading ? (
            <section className="panel"><p>실제 API 데이터를 불러오는 중입니다...</p></section>
          ) : (
            <ActivePage data={data} currentUser={currentUser} actions={actions} globalSearch={globalSearch} />
          )}
        </div>
      </main>

      {formModal ? <FormModal modal={formModal} onClose={() => setFormModal(null)} onSubmit={submitForm} submitting={formSubmitting} /> : null}
      {detailModal ? <DetailModal detail={detailModal} onClose={() => setDetailModal(null)} /> : null}
      {notificationCenterOpen ? (
        <NotificationCenterModal
          notifications={data.notifications}
          currentUser={currentUser}
          users={data.users}
          onClose={() => setNotificationCenterOpen(false)}
          onMarkAllRead={markNotificationsRead}
          onMarkRead={markSingleNotificationRead}
          onSend={sendNotification}
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
  );
}
