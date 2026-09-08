import { useEffect, useMemo, useState } from "react";
import { clearAuthSession, logoutUser, readAuthSession, saveAuthSession } from "./api/auth.js";
import { touchSessionActivity } from "./api/client.js";
import {
  addPublicationAttachment,
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
  deletePublicationAttachment,
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
import PublicationFilesModal from "./components/PublicationFilesModal.jsx";
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
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import { todayISO } from "./utils/format.js";
import { canAccess, canManageContent, hasRole } from "./utils/permissions.js";

const pageRegistry = {
  dashboard: { title: "대시보드", component: DashboardPage },
  notices: { title: "공지사항", component: NoticesPage },
  calendar: { title: "일정", component: CalendarPage },
  attendance: { title: "근태", component: AttendancePage },
  leave: { title: "휴가", component: LeavePage },
  projects: { title: "연구과제", component: ProjectsPage },
  publications: { title: "논문", component: PublicationsPage },
  files: { title: "파일", component: FilesPage },
  purchases: { title: "구매", component: PurchasesPage },
  budget: { title: "예산", component: BudgetPage },
  credentials: { title: "공용 계정", component: CredentialsPage },
  admin: { title: "관리", component: AdminPage },
  mypage: { title: "내 정보", component: MyPage },
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

function option(value, label) {
  return label === undefined ? { value } : { value, label };
}

const fieldLabelMap = {
  title: "제목", category: "분류", content: "내용", is_pinned: "상단 고정", description: "설명",
  event_type: "일정 유형", scope: "공개 범위", start_datetime: "시작 일시", end_datetime: "종료 일시",
  location: "장소", is_recurring: "반복 일정", recurrence_rule: "반복 규칙", leave_type: "휴가 유형",
  half_period: "반차 시간", start_date: "시작일", end_date: "종료일", reason: "사유", authors_text: "저자",
  year: "연도", published_date: "게재일", pub_type: "논문 유형", status: "상태", venue: "게재지", doi: "DOI",
  is_public: "공개 여부", username: "아이디", password: "비밀번호", url: "주소", memo: "메모", min_role: "최소 권한",
  filename: "파일명", file_url: "파일 주소", mime_type: "파일 형식", filesize: "파일 크기", item_name: "물품명",
  quantity: "수량", estimated_price: "예상 금액", purchase_url: "구매 주소", fund_type: "재원 구분",
  total_budget: "총 예산액", project_id: "연구과제", budget_id: "예산 장부", amount: "금액", date: "지출일",
  current_password: "현재 비밀번호", new_password: "새 비밀번호", confirm_password: "새 비밀번호 확인",
  check_in: "출근 시각", check_out: "퇴근 시각",
};

const optionLabelMap = {
  general: "일반", important: "중요", account_info: "계정", schedule: "일정", meeting: "회의", deadline: "마감",
  event: "행사", trip: "출장", other: "기타", shared: "공용", personal: "개인", annual: "연차", half: "반차",
  am: "오전", pm: "오후", sci: "SCI", kci: "KCI", intl_conf: "국제 학회", domestic_conf: "국내 학회",
  writing: "작성 중", submitted: "제출", under_review: "심사 중", accepted: "채택", published: "출판",
  paper: "논문", presentation: "발표", template: "템플릿", software: "소프트웨어", wifi: "와이파이", server: "서버",
  cloud: "클라우드", license: "라이선스", personnel: "인건비", activity: "활동비", material: "재료비",
  department: "학과", research: "연구비", active: "진행", completed: "완료", pending: "대기", member: "구성원",
  manager: "관리자", admin: "최고 관리자", present: "출석", late: "지각", absent: "결석", leave: "휴가", half_leave: "반차",
  undergrad: "학부", master: "석사", phd: "박사", professor: "교수", ko: "한국어", en: "영어", unknown: "알 수 없음",
  all: "전체", latest: "최신순", views: "조회순", pinned: "고정 우선", intl_conf: "국제 학회", domestic_conf: "국내 학회",
  half: "반차", modify: "회차 수정", cancel: "회차 취소", personnel: "인건비", activity: "활동비", material: "재료비",
  completed: "완료", department: "학과", wifi: "와이파이", server: "서버", cloud: "클라우드", license: "라이선스",
};

function displayLabel(value) {
  if (value === "") return "";
  return optionLabelMap[String(value)] || String(value);
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
        { name: "title", label: "제목", type: "text" },
        {
          name: "category",
          label: "분류",
          type: "select",
          options: ["general", "important", "account_info", "schedule"],
        },
        { name: "content", label: "내용", type: "textarea" },
        {
          name: "attachment_files",
          label: "첨부파일",
          type: "file",
          multiple: true,
          help: "선택한 파일은 Supabase Storage에 업로드된 뒤 공지 첨부로 저장됩니다.",
        },
        { name: "is_pinned", label: "상단 고정", type: "checkbox" },
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
        { name: "title", label: "제목", type: "text" },
        { name: "description", label: "설명", type: "textarea" },
        { name: "event_type", label: "일정 유형", type: "select", options: ["meeting", "deadline", "event", "trip", "other"] },
        { name: "scope", label: "공개 범위", type: "select", options: ["shared", "personal"] },
        { name: "start_datetime", label: "시작 일시", type: "datetime-local" },
        { name: "end_datetime", label: "종료 일시", type: "datetime-local" },
        { name: "location", label: "장소", type: "text" },
        { name: "is_recurring", label: "반복 일정", type: "checkbox" },
        { name: "recurrence_rule", label: "반복 규칙", type: "text" },
      ],
      create: (values) => ({ id: uid("event"), ...values }),
    },
    leaveRequests: {
      createTitle: "휴가 신청",
      editTitle: "휴가 신청 수정",
      defaults: { leave_type: "annual", half_period: "", start_date: todayISO(), end_date: todayISO(), status: "pending" },
      fields: [
        { name: "leave_type", label: "휴가 유형", type: "select", options: ["annual", "half", "other"] },
        { name: "half_period", label: "반차 시간", type: "select", options: ["", "am", "pm"] },
        { name: "start_date", label: "시작일", type: "date" },
        { name: "end_date", label: "종료일", type: "date" },
        { name: "reason", label: "사유", type: "textarea" },
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
        { name: "title", label: "제목", type: "text" },
        { name: "authors_text", label: "저자", type: "text" },
        {
          name: "author_user_ids",
          label: "내부 저자 연결",
          type: "multiselect",
          options: data.users
            .filter((user) => user.account_status === "approved")
            .map((user) => option(user.id, `${user.name} · ${user.email}`)),
          help: "선택한 순서대로 내부 저자가 연결됩니다.",
        },
        { name: "year", label: "연도", type: "text" },
        { name: "published_date", label: "게재일", type: "date" },
        { name: "pub_type", label: "논문 유형", type: "select", options: ["sci", "kci", "intl_conf", "domestic_conf"] },
        { name: "status", label: "상태", type: "select", options: ["writing", "submitted", "under_review", "accepted", "published"] },
        { name: "venue", label: "게재지", type: "text" },
        { name: "doi", label: "식별자(DOI)", type: "text" },
        {
          name: "attachment_files",
          label: "논문 첨부파일",
          type: "file",
          multiple: true,
          help: "원문·증빙 파일을 Supabase Storage에 업로드하고 논문 첨부로 등록합니다.",
        },
        { name: "is_public", label: "공개 여부", type: "checkbox" },
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
        { name: "title", label: "제목", type: "text" },
        { name: "description", label: "설명", type: "textarea" },
        { name: "category", label: "분류", type: "select", options: ["paper", "presentation", "template", "software", "other"] },
        { name: "min_role", label: "최소 권한", type: "select", options: ["member", "manager", "admin"] },
        { name: "filename", label: "파일명", type: "text" },
        { name: "file_url", label: "파일 주소", type: "url" },
        { name: "mime_type", label: "파일 형식", type: "text" },
        { name: "filesize", label: "파일 크기", type: "number" },
      ],
      create: (values) => ({ id: uid("file"), ...values, download_count: 0, uploaded_at: todayISO() }),
    },
    purchaseRequests: {
      createTitle: "구매 신청",
      editTitle: "구매 신청 수정",
      defaults: { quantity: 1, estimated_price: 0, status: "pending" },
      fields: [
        { name: "item_name", label: "물품명", type: "text" },
        { name: "quantity", label: "수량", type: "number" },
        { name: "estimated_price", label: "예상 금액", type: "number" },
        { name: "purchase_url", label: "구매 주소", type: "url" },
        { name: "reason", label: "사유", type: "textarea" },
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
        { name: "category", label: "분류", type: "select", options: ["personnel", "activity", "material", "other"] },
        { name: "item_name", label: "지출 항목", type: "text" },
        { name: "amount", label: "금액", type: "number" },
        { name: "date", label: "지출일", type: "date" },
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
        { name: "title", label: "제목", type: "text" },
        { name: "category", label: "분류", type: "select", options: ["wifi", "server", "cloud", "license", "other"] },
        { name: "username", label: "아이디", type: "text" },
        { name: "password", label: "비밀번호", type: "password" },
        { name: "url", label: "주소", type: "url" },
        { name: "memo", label: "메모", type: "textarea" },
        { name: "min_role", label: "최소 권한", type: "select", options: ["member", "manager", "admin"] },
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
    const attachments = await Promise.all(values.attachment_files.map((item) => uploadFileToStorage(item.file, "publications")));
    return { ...values, attachments };
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
                <span>{fieldLabelMap[field.name] || field.label}</span>
              </label>
            );
          }

          if (field.type === "textarea") {
            return (
              <label key={field.name} className="field">
                <span>{fieldLabelMap[field.name] || field.label}</span>
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
                <legend>{fieldLabelMap[field.name] || field.label}</legend>
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
                        <span>{optionItem.label || displayLabel(optionValue)}</span>
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
                <span>{fieldLabelMap[field.name] || field.label}</span>
                <select value={value} onChange={(event) => updateValue(field.name, event.target.value)}>
                  {field.options.map((item) => {
                    const optionItem = typeof item === "string" ? option(item) : item;
                    return (
                      <option key={optionItem.value} value={optionItem.value}>
                        {optionItem.label || displayLabel(optionItem.value)}
                      </option>
                    );
                  })}
                </select>
              </label>
            );
          }

          return (
            <label key={field.name} className="field">
              <span>{fieldLabelMap[field.name] || field.label}</span>
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
            <dt>{fieldLabelMap[item.label] || item.label}</dt>
            <dd>{typeof item.value === "boolean" ? (item.value ? "예" : "아니오") : displayLabel(item.value || "-")}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

export default function App() {
  const [authSession, setAuthSession] = useState(() => readAuthSession());
  const [showRegister, setShowRegister] = useState(() => window.location.hash === "#/register");
  const isPasswordResetRoute = window.location.pathname.replace(/\/+$/, "") === "/reset-password";
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
  const [publicationFilesModal, setPublicationFilesModal] = useState(null);
  const [publicationFilesUploading, setPublicationFilesUploading] = useState(false);
  const [deletingPublicationAttachmentId, setDeletingPublicationAttachmentId] = useState(null);
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
    if (!authSession) return undefined;
    const activityEvents = ["click", "keydown", "pointerdown", "touchstart"];
    const markActivity = () => touchSessionActivity();
    activityEvents.forEach((eventName) => window.addEventListener(eventName, markActivity, { passive: true }));
    const timer = window.setInterval(() => {
      readAuthSession();
    }, 60 * 1000);
    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, markActivity));
      window.clearInterval(timer);
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
    const canEdit = key === "publications" || key === "researchProjects"
      ? canManageContent(currentUser, item)
      : hasRole(currentUser, "manager");
    if (!canEdit) {
      showToast("이 항목을 수정할 권한이 없습니다.", "warning");
      return;
    }
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
        const attachmentDrafts = key === "publications" ? preparedValues.attachments || [] : [];
        const updateValues = key === "publications"
          ? Object.fromEntries(Object.entries(preparedValues).filter(([name]) => name !== "attachments" && name !== "attachment_files"))
          : preparedValues;
        const updated = normalizeResource(key, await updateResource(key, item.id, updateValues));
        if (key === "publications" && attachmentDrafts.length) {
          const attachments = await Promise.all(
            attachmentDrafts.map((attachment) => addPublicationAttachment(item.id, attachment)),
          );
          updated.attachments = [...(item.attachments || []), ...attachments];
        }
        if (key === "budgets") updated.used_amount = item.used_amount;
        replaceItem(key, item.id, updated);
      },
    });
  };

  const openForm = (modal) => {
    setFormModal(modal);
  };

  const deleteItem = (key, id, label) => {
    const item = data[key]?.find((current) => current.id === id);
    const canDelete = item && (key === "publications" || key === "researchProjects")
      ? canManageContent(currentUser, item)
      : hasRole(currentUser, "manager");
    if (!canDelete) {
      showToast("이 항목을 삭제할 권한이 없습니다.", "warning");
      return;
    }
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

  const openNotification = async (notification) => {
    try {
      if (!notification.read) await markSingleNotificationRead(notification.id);
      const pageByType = {
        notice_created: "notices",
        leave_requested: "leave",
        purchase_requested: "purchases",
      };
      setActivePage(pageByType[notification.type] || "dashboard");
      setNotificationCenterOpen(false);
    } catch (error) {
      showToast(error.message, "error");
    }
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
      } else if (key === "purchaseRequests" && ["pending", "approved", "rejected"].includes(patch.status)) {
        updated = await reviewPurchase(id, patch.status);
      } else if (key === "purchaseRequests" && ["purchased", "delivered"].includes(patch.status)) {
        updated = await advancePurchase(id, patch.status);
      } else if (key === "leaveRequests" && ["pending", "approved", "rejected"].includes(patch.status)) {
        updated = await reviewLeave(id, patch.status);
      } else if (key === "expenses" && ["pending", "approved", "rejected"].includes(patch.status)) {
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

  const openPublicationFiles = async (publication) => {
    try {
      const detail = normalizeResource("publications", await getPublication(publication.id));
      setPublicationFilesModal(detail);
      replaceItem("publications", publication.id, { attachments: detail.attachments || [] });
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const uploadPublicationFiles = async (files) => {
    if (!publicationFilesModal || !files.length) return false;
    const publicationId = publicationFilesModal.id;
    setPublicationFilesUploading(true);
    try {
      const uploadedFiles = await Promise.all(files.map((file) => uploadFileToStorage(file, "publications")));
      const attachments = await Promise.all(
        uploadedFiles.map((attachment) => addPublicationAttachment(publicationId, attachment)),
      );
      setPublicationFilesModal((current) => current && Number(current.id) === Number(publicationId)
        ? { ...current, attachments: [...(current.attachments || []), ...attachments] }
        : current);
      updateCollection("publications", (items) => items.map((item) => Number(item.id) === Number(publicationId)
        ? { ...item, attachments: [...(item.attachments || []), ...attachments] }
        : item));
      showToast(`${attachments.length}개 논문 파일을 등록했습니다.`);
      return true;
    } catch (error) {
      try {
        const refreshed = normalizeResource("publications", await getPublication(publicationId));
        setPublicationFilesModal((current) => current && Number(current.id) === Number(publicationId) ? refreshed : current);
        replaceItem("publications", publicationId, { attachments: refreshed.attachments || [] });
      } catch {
        // 일부 파일만 등록된 경우에도 원래 오류 메시지를 우선 안내합니다.
      }
      showToast(error.message, "error");
      return false;
    } finally {
      setPublicationFilesUploading(false);
    }
  };

  const confirmPublicationAttachmentDelete = (attachment) => {
    if (!publicationFilesModal) return;
    const publicationId = publicationFilesModal.id;
    setConfirmModal({
      title: "논문 파일 삭제",
      message: `${attachment.filename} 파일을 논문 첨부 목록에서 삭제할까요?`,
      confirmLabel: "파일 삭제",
      onConfirm: async () => {
        setDeletingPublicationAttachmentId(attachment.id);
        try {
          await deletePublicationAttachment(publicationId, attachment.id);
          setPublicationFilesModal((current) => current && Number(current.id) === Number(publicationId)
            ? { ...current, attachments: (current.attachments || []).filter((item) => Number(item.id) !== Number(attachment.id)) }
            : current);
          updateCollection("publications", (items) => items.map((item) => Number(item.id) === Number(publicationId)
            ? { ...item, attachments: (item.attachments || []).filter((file) => Number(file.id) !== Number(attachment.id)) }
            : item));
          setConfirmModal(null);
          showToast("논문 파일을 삭제했습니다.");
        } catch (error) {
          showToast(error.message, "error");
        } finally {
          setDeletingPublicationAttachmentId(null);
        }
      },
    });
  };

  const getCredentialPassword = async (credential) => {
    return new Promise((resolve, reject) => {
      setFormModal({
        title: "비밀번호 확인",
        fields: [{ name: "current_password", label: "현재 로그인 비밀번호", type: "password" }],
        initialValues: { current_password: "" },
        submitLabel: "확인",
        successMessage: "비밀번호를 확인했습니다.",
        onSubmit: async (values) => {
          try {
            const revealed = await revealCredential(credential.id, values.current_password);
            resolve(revealed.password);
          } catch (error) {
            reject(error);
            throw error;
          }
        },
      });
    });
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
    openPublicationFiles,
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
    const nextSession = { ...session, lastActivity: Date.now() };
    saveAuthSession(nextSession);
    setAuthSession(nextSession);
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

  const returnToLogin = () => {
    window.location.assign("/");
  };

  if (isPasswordResetRoute) {
    return <ResetPasswordPage onBackToLogin={returnToLogin} />;
  }

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
            <section className="panel loading-panel">
              <span className="ai-loader" aria-hidden="true" />
              <p>실제 API 데이터를 불러오는 중입니다...</p>
            </section>
          ) : (
            <ActivePage key={activePage} data={data} currentUser={currentUser} actions={actions} globalSearch={globalSearch} />
          )}
        </div>
      </main>

      {formModal ? <FormModal modal={formModal} onClose={() => setFormModal(null)} onSubmit={submitForm} submitting={formSubmitting} /> : null}
      {detailModal ? <DetailModal detail={detailModal} onClose={() => setDetailModal(null)} /> : null}
      {publicationFilesModal ? (
        <PublicationFilesModal
          publication={publicationFilesModal}
          uploading={publicationFilesUploading}
          deletingId={deletingPublicationAttachmentId}
          onClose={() => setPublicationFilesModal(null)}
          onUpload={uploadPublicationFiles}
          onDelete={confirmPublicationAttachmentDelete}
        />
      ) : null}
      {notificationCenterOpen ? (
        <NotificationCenterModal
          notifications={data.notifications}
          currentUser={currentUser}
          users={data.users}
          onClose={() => setNotificationCenterOpen(false)}
          onMarkAllRead={markNotificationsRead}
          onMarkRead={markSingleNotificationRead}
          onOpenNotification={openNotification}
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
