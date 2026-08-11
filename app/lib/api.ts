import type { ApiError } from "./types";
import { demoRequest, isDemoMode } from "./demoApi";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const ACCESS_KEY = "aics_access_token";
const REFRESH_KEY = "aics_refresh_token";

export const authStore = {
  access: () => typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY),
  refresh: () => typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY),
  save: (data: Record<string, unknown>) => {
    const access = data.accessToken || data.access_token;
    const refresh = data.refreshToken || data.refresh_token;
    if (typeof access === "string") localStorage.setItem(ACCESS_KEY, access);
    if (typeof refresh === "string") localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); },
};

const errorMessage = (status: number, fallback?: string) => ({
  400: fallback || "입력 내용을 확인해 주세요.", 401: "로그인이 필요합니다.",
  403: "이 작업을 수행할 권한이 없습니다.", 404: "요청한 정보를 찾을 수 없습니다.",
  409: fallback || "이미 처리되었거나 충돌이 발생했습니다.", 500: "서버에서 문제가 발생했습니다.",
}[status] || fallback || "요청을 처리하지 못했습니다.");

async function refreshAccess() {
  const token = authStore.refresh();
  if (!token) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken: token }),
    });
    const body = await response.json();
    if (!response.ok || body.success === false) throw new Error();
    authStore.save(body.data || body);
    return true;
  } catch { authStore.clear(); return false; }
}

export async function request<T = unknown>(path: string, options: RequestInit & { public?: boolean; retry?: boolean } = {}): Promise<T> {
  if (isDemoMode()) return demoRequest<T>(path, options);
  const { public: isPublic = false, retry = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  if (!(fetchOptions.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const token = authStore.access();
  if (!isPublic && token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try { response = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers }); }
  catch { const err = new Error("서버에 연결할 수 없습니다.") as ApiError; err.code = "NETWORK_ERROR"; throw err; }
  if (response.status === 401 && !isPublic && retry && await refreshAccess()) return request<T>(path, { ...options, retry: false });
  let body: { success?: boolean; data?: T; message?: string } = {};
  try { body = await response.json(); } catch { /* empty response */ }
  if (!response.ok || body.success === false) {
    if (response.status === 401) authStore.clear();
    const err = new Error(errorMessage(response.status, body.message)) as ApiError; err.status = response.status; throw err;
  }
  return (body.data ?? body) as T;
}

export const api = {
  auth: {
    login: (body: unknown) => request<Record<string, unknown>>("/api/auth/login", { method: "POST", body: JSON.stringify(body), public: true }),
    register: (body: unknown) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body), public: true }),
    resetRequest: (body: unknown) => request("/api/auth/password/reset-request", { method: "POST", body: JSON.stringify(body), public: true }),
    reset: (body: unknown) => request("/api/auth/password/reset", { method: "POST", body: JSON.stringify(body), public: true }),
    logout: () => request("/api/auth/logout", { method: "POST" }),
  },
  users: { me: () => request<Record<string, unknown>>("/api/users/me"), admin: () => request("/api/users/admin-dashboard") },
  notices: { list: () => request<unknown[]>("/api/notices"), get: (id: string) => request(`/api/notices/${id}`), create: (b: unknown) => request("/api/notices", { method: "POST", body: JSON.stringify(b) }) },
  calendar: {
    list: (q = "") => request<unknown[]>(`/api/calendar/events${q}`), get: (id: string) => request(`/api/calendar/events/${id}`),
    create: (b: unknown) => request("/api/calendar/events", { method: "POST", body: JSON.stringify(b) }),
    update: (id: string, b: unknown) => request(`/api/calendar/events/${id}`, { method: "PATCH", body: JSON.stringify(b) }),
    remove: (id: string) => request(`/api/calendar/events/${id}`, { method: "DELETE" }),
    exception: (id: string, b: unknown) => request(`/api/calendar/events/${id}/exceptions`, { method: "POST", body: JSON.stringify(b) }),
    split: (id: string, b: unknown) => request(`/api/calendar/events/${id}/split`, { method: "POST", body: JSON.stringify(b) }),
  },
  attendance: { checkIn: () => request("/api/attendance/check-in", { method: "POST" }), checkOut: () => request("/api/attendance/check-out", { method: "POST" }) },
  leave: { create: (b: unknown) => request("/api/leave/requests", { method: "POST", body: JSON.stringify(b) }), review: (id: string, b: unknown) => request(`/api/leave/requests/${id}/review`, { method: "PUT", body: JSON.stringify(b) }) },
  budget: { create: (b: unknown) => request("/api/budget/expenses", { method: "POST", body: JSON.stringify(b) }), review: (id: string, b: unknown) => request(`/api/budget/expenses/${id}/review`, { method: "PUT", body: JSON.stringify(b) }) },
  procurement: { create: (b: unknown) => request("/api/procurement/requests", { method: "POST", body: JSON.stringify(b) }), review: (id: string, b: unknown) => request(`/api/procurement/requests/${id}/review`, { method: "PUT", body: JSON.stringify(b) }), status: (id: string, b: unknown) => request(`/api/procurement/requests/${id}/status`, { method: "PUT", body: JSON.stringify(b) }) },
  publications: crud("/api/publications"), files: crud("/api/files"), credentials: crud("/api/credentials"),
  notifications: { list: () => request<unknown[]>("/api/notifications"), count: () => request<{ count?: number }>("/api/notifications/unread-count"), send: (b: unknown) => request("/api/notifications", { method: "POST", body: JSON.stringify(b) }), readAll: () => request("/api/notifications/read-all", { method: "PATCH" }), read: (id: string) => request(`/api/notifications/${id}/read`, { method: "PATCH" }) },
  applications: { publicCreate: (b: unknown) => request("/api/public/applications", { method: "POST", body: JSON.stringify(b), public: true }), list: () => request<unknown[]>("/api/applications"), get: (id: string) => request(`/api/applications/${id}`), update: (id: string, b: unknown) => request(`/api/applications/${id}`, { method: "PATCH", body: JSON.stringify(b) }), remove: (id: string) => request(`/api/applications/${id}`, { method: "DELETE" }) },
};

function crud(base: string) { return { list: () => request<unknown[]>(base), get: (id: string) => request(`${base}/${id}`), create: (b: unknown) => request(base, { method: "POST", body: JSON.stringify(b) }), update: (id: string, b: unknown) => request(`${base}/${id}`, { method: "PATCH", body: JSON.stringify(b) }), remove: (id: string) => request(`${base}/${id}`, { method: "DELETE" }) }; }
