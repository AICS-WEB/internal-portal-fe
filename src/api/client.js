export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://aics-web-backend.onrender.com/api"
).replace(/\/$/, "");

const SESSION_KEY = "aics-auth-session";

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function saveSession(session) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function readSession() {
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
}

function buildUrl(path, query) {
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, window.location.origin);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function parseResponse(response) {
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success === false) {
    throw new ApiError(result?.message || `API 요청에 실패했습니다. (${response.status})`, response.status, result?.data);
  }
  return result?.data;
}

async function refreshAccessToken(refreshToken) {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await parseResponse(response);
  const session = readSession();
  if (!session || !data?.accessToken) throw new ApiError("로그인 세션을 갱신할 수 없습니다.", 401);
  saveSession({ ...session, accessToken: data.accessToken });
  return data.accessToken;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", query, body, auth = true, retry = true } = options;
  const session = readSession();
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  if (response.status === 401 && auth && retry && session?.refreshToken) {
    try {
      await refreshAccessToken(session.refreshToken);
      return apiRequest(path, { ...options, retry: false });
    } catch (error) {
      clearSession();
      window.dispatchEvent(new CustomEvent("aics:session-expired"));
      throw error;
    }
  }

  return parseResponse(response);
}
