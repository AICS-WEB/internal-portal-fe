import { apiRequest } from "./client.js";

const payloadMappers = {
  calendarEvents: (value) => ({
    title: value.title,
    description: value.description || null,
    eventType: value.event_type,
    scope: value.scope,
    colorKey: value.color_key || null,
    startDatetime: value.start_datetime,
    endDatetime: value.end_datetime,
    isAllDay: Boolean(value.is_all_day),
    location: value.location || null,
    isRecurring: Boolean(value.is_recurring),
    recurrenceRule: value.recurrence_rule || null,
    ...(Array.isArray(value.participants) ? { participants: value.participants } : {}),
  }),
  publications: (value) => ({
    title: value.title,
    authorsText: value.authors_text,
    year: Number(value.year),
    publishedDate: value.published_date || null,
    pubType: value.pub_type,
    status: value.status,
    venue: value.venue || null,
    doi: value.doi || null,
    isPublic: Boolean(value.is_public),
    ...(Array.isArray(value.authors)
      ? {
          authors: value.authors.map((author) => ({
            userId: author.userId ?? author.user_id,
            authorOrder: author.authorOrder ?? author.author_order ?? null,
            isCorresponding: Boolean(author.isCorresponding ?? author.is_corresponding),
          })),
        }
      : {}),
  }),
  sharedFiles: (value) => ({
    title: value.title,
    description: value.description || null,
    category: value.category,
    minRole: value.min_role,
    filename: value.filename,
    mimeType: value.mime_type || null,
    fileUrl: value.file_url,
    filesize: value.filesize ? Number(value.filesize) : null,
  }),
  sharedCredentials: (value) => ({
    title: value.title,
    category: value.category,
    username: value.username || null,
    password: value.password || undefined,
    url: value.url || null,
    memo: value.memo || null,
    minRole: value.min_role,
  }),
  purchaseRequests: (value) => ({
    itemName: value.item_name,
    quantity: Number(value.quantity),
    estimatedPrice: Number(value.estimated_price),
    purchaseUrl: value.purchase_url || null,
    reason: value.reason,
  }),
  leaveRequests: (value) => ({
    leaveType: value.leave_type,
    halfPeriod: value.leave_type === "half" ? value.half_period : null,
    startDate: value.start_date,
    endDate: value.end_date,
    reason: value.reason || null,
  }),
  expenses: (value) => ({
    budgetId: Number(value.budget_id),
    category: value.category,
    itemName: value.item_name,
    amount: Number(value.amount),
    date: value.date,
  }),
  notices: (value) => ({
    title: value.title,
    content: value.content,
    category: value.category,
    isPinned: Boolean(value.is_pinned),
    attachments: [],
  }),
};

const resourcePaths = {
  calendarEvents: "/calendar/events",
  publications: "/publications",
  sharedFiles: "/files",
  sharedCredentials: "/credentials",
};

export function toApiPayload(resource, value) {
  return payloadMappers[resource]?.(value) || value;
}

export function normalizeResource(resource, value) {
  if (!value) return value;
  if (resource === "notices") return normalizeNotice(value);
  if (resource === "calendarEvents") {
    return {
      ...value,
      start_datetime: typeof value.start_datetime === "string" ? value.start_datetime.slice(0, 16) : value.start_datetime,
      end_datetime: typeof value.end_datetime === "string" ? value.end_datetime.slice(0, 16) : value.end_datetime,
    };
  }
  if (resource === "publications") return { ...value, year: String(value.year) };
  if (resource === "sharedFiles") {
    return { ...value, uploaded_at: dateOnly(value.uploaded_at || value.created_at) };
  }
  if (resource === "leaveRequests") return { ...value, requested_at: dateOnly(value.requested_at || value.created_at) };
  if (resource === "purchaseRequests") return { ...value, requested_at: dateOnly(value.requested_at || value.created_at) };
  return value;
}

function timeOnly(value) {
  if (!value) return "";
  const text = String(value);
  return text.includes("T") ? text.slice(11, 16) : text.slice(0, 5);
}

export function normalizeAttendanceRecord(value, fallbackUser) {
  return {
    ...value,
    user_id: value.user_id || fallbackUser?.id,
    user_name: value.user_name || fallbackUser?.name || "-",
    date: dateOnly(value.date),
    check_in: timeOnly(value.check_in),
    check_out: timeOnly(value.check_out),
  };
}

function attendanceTimestamp(value, date) {
  if (value === "" || value === null) return value;
  if (!value) return undefined;
  return String(value).includes("T") ? value : `${date}T${value}:00`;
}

export async function createResource(resource, value) {
  const path = resourcePaths[resource];
  if (!path) throw new Error("이 항목은 생성 API가 연결되지 않았습니다.");
  return apiRequest(path, { method: "POST", body: toApiPayload(resource, value) });
}

export async function updateResource(resource, id, value) {
  const path = resourcePaths[resource];
  if (!path) throw new Error("이 항목은 수정 API가 연결되지 않았습니다.");
  return apiRequest(`${path}/${id}`, { method: "PATCH", body: toApiPayload(resource, value) });
}

export async function deleteResource(resource, id) {
  const path = resourcePaths[resource];
  if (!path) throw new Error("이 항목은 삭제 API가 연결되지 않았습니다.");
  return apiRequest(`${path}/${id}`, { method: "DELETE" });
}

export async function createNotice(value) {
  const data = await apiRequest("/notices", { method: "POST", body: toApiPayload("notices", value) });
  return data.notice;
}

export async function getNotice(id) {
  const data = await apiRequest(`/notices/${id}`);
  return normalizeNotice(data.notice);
}

export async function getPublication(id) {
  return apiRequest(`/publications/${id}`);
}

export async function createPurchase(value) {
  const data = await apiRequest("/procurement/requests", {
    method: "POST",
    body: toApiPayload("purchaseRequests", value),
  });
  return data.request;
}

export async function reviewPurchase(id, status, rejectReason = null) {
  const data = await apiRequest(`/procurement/requests/${id}/review`, {
    method: "PUT",
    body: { status, rejectReason },
  });
  return data.result;
}

export async function advancePurchase(id, status) {
  const data = await apiRequest(`/procurement/requests/${id}/status`, { method: "PUT", body: { status } });
  return data.result;
}

export async function createLeave(value) {
  const data = await apiRequest("/leave/requests", { method: "POST", body: toApiPayload("leaveRequests", value) });
  return data.request || data.leaveRequest || data;
}

export async function reviewLeave(id, status, rejectReason = null) {
  const data = await apiRequest(`/leave/requests/${id}/review`, {
    method: "PUT",
    body: { status, rejectReason },
  });
  return data.result;
}

export async function createExpense(value) {
  const data = await apiRequest("/budget/expenses", { method: "POST", body: toApiPayload("expenses", value) });
  return data.expense;
}

export async function reviewExpense(id, status, rejectReason = null) {
  const data = await apiRequest(`/budget/expenses/${id}/review`, {
    method: "PUT",
    body: { status, rejectReason },
  });
  return data.result;
}

export async function checkAttendance(type) {
  const path = type === "in" ? "check-in" : "check-out";
  const data = await apiRequest(`/attendance/${path}`, { method: "POST" });
  return data.attendance;
}

export async function patchAttendanceRecord(record, values) {
  return apiRequest(`/attendance/records/${record.id}`, {
    method: "PATCH",
    body: {
      status: values.status,
      checkIn: attendanceTimestamp(values.check_in, record.date),
      checkOut: attendanceTimestamp(values.check_out, record.date),
    },
  });
}

export async function reviewPendingUser(id, decision) {
  const data = await apiRequest(`/users/${id}/${decision}`, { method: "PATCH" });
  return data.user;
}

export async function revealCredential(id) {
  return apiRequest(`/credentials/${id}/reveal`);
}

export async function logCredentialCopy(id) {
  return apiRequest(`/credentials/${id}/copy`, { method: "POST" });
}

export async function getFileDownload(id) {
  return apiRequest(`/files/${id}/download`);
}

export async function getLeaveBalance() {
  return apiRequest("/leave/balance");
}

export async function markAllNotificationsRead() {
  return apiRequest("/notifications/read-all", { method: "PATCH" });
}

function dateOnly(value) {
  return typeof value === "string" ? value.slice(0, 10) : value;
}

function normalizeNotice(value) {
  return {
    ...value,
    author: value.author ?? value.author_name ?? "-",
    views: Number(value.views ?? value.view_count ?? 0),
    created_at: dateOnly(value.created_at),
  };
}

function normalizeNotification(value) {
  return { ...value, read: Boolean(value.read ?? value.is_read) };
}

function normalizeProject(value) {
  const rawStatus = String(value.status || "").toLowerCase();
  return {
    ...value,
    funding_agency: value.funding_agency || value.program || value.organization || value.sponsor || "-",
    owner: value.owner || value.principal_investigator || value.pi_name || "-",
    role: value.role || "-",
    status: rawStatus === "ongoing" || rawStatus === "active" ? "active" : "closed",
  };
}

function calendarRange() {
  const year = new Date().getFullYear();
  return { start: `${year - 1}-01-01T00:00:00.000Z`, end: `${year + 2}-01-01T00:00:00.000Z` };
}

export async function loadPortalData(currentUser) {
  const loaders = {
    users: Promise.all([
      apiRequest("/public/members", { auth: false }),
      ["manager", "admin"].includes(currentUser?.role)
        ? apiRequest("/users/pending").then((data) => data.users || [])
        : Promise.resolve([]),
    ]).then(([groups, pendingUsers]) => {
      const members = [...(groups.current_students || []), ...(groups.alumni || [])];
      const profile = members.find((member) => Number(member.id) === Number(currentUser?.id));
      return [{ ...(profile || {}), ...currentUser }, ...pendingUsers];
    }),
    attendanceRecords: apiRequest("/attendance/records").then((items) => items.map((item) => normalizeAttendanceRecord(item))),
    notices: apiRequest("/notices").then((data) => (data.notices || []).map(normalizeNotice)),
    calendarEvents: apiRequest("/calendar/events", { query: calendarRange() }).then((items) => items.map((item) => normalizeResource("calendarEvents", item))),
    publications: apiRequest("/publications").then((items) => items.map((item) => normalizeResource("publications", item))),
    sharedFiles: apiRequest("/files").then((items) => items.map((item) => normalizeResource("sharedFiles", item))),
    purchaseRequests: apiRequest("/procurement/requests"),
    sharedCredentials: apiRequest("/credentials"),
    notifications: apiRequest("/notifications").then((items) => items.map(normalizeNotification)),
    leaveBalances: apiRequest("/leave/balance").then((item) => [item]),
    researchProjects: apiRequest("/public/research-projects", { auth: false }).then((items) => items.map(normalizeProject)),
  };

  const entries = await Promise.all(
    Object.entries(loaders).map(async ([key, promise]) => {
      try {
        return [key, await promise, null];
      } catch (error) {
        return [key, [], error];
      }
    }),
  );

  const data = {
    users: currentUser ? [currentUser] : [],
    leaveRequests: [],
    budgets: [],
    expenses: [],
  };
  const errors = [];
  entries.forEach(([key, value, error]) => {
    data[key] = value;
    if (error) errors.push({ key, error });
  });
  return { data, errors };
}
