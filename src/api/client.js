const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const STORAGE_KEY = "aics.lab.auth";

let refreshPromise = null;
let unauthorizedHandler = null;

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, isNetworkError = false } = {}) {
    super(message || "요청 처리 중 오류가 발생했습니다.");
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getStoredSession() {
  const storage = getStorage();
  if (!storage) return { accessToken: "", refreshToken: "", user: null };

  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { accessToken: "", refreshToken: "", user: null };
  } catch {
    storage.removeItem(STORAGE_KEY);
    return { accessToken: "", refreshToken: "", user: null };
  }
}

export function saveAuthSession(session) {
  const storage = getStorage();
  if (!storage) return;
  const current = getStoredSession();
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: session.accessToken ?? current.accessToken ?? "",
      refreshToken: session.refreshToken ?? current.refreshToken ?? "",
      user: session.user ?? current.user ?? null,
    }),
  );
}

export function clearAuthSession() {
  const storage = getStorage();
  if (storage) storage.removeItem(STORAGE_KEY);
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function buildUrl(path, query) {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function parseResponse(response) {
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const fallbackMessages = {
      401: "로그인이 필요합니다.",
      403: "접근 권한이 없습니다.",
      404: "요청한 정보를 찾을 수 없습니다.",
      409: "이미 처리되었거나 충돌하는 요청입니다.",
      500: "서버에서 요청을 처리하지 못했습니다.",
    };
    throw new ApiError(payload?.message || fallbackMessages[response.status] || `요청에 실패했습니다. (${response.status})`, {
      status: response.status,
      data: payload?.data ?? payload,
    });
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, "success")) {
    if (!payload.success) {
      throw new ApiError(payload.message, {
        status: response.status,
        data: payload.data,
      });
    }
    return payload.data;
  }

  return payload;
}

async function refreshAccessToken() {
  const { refreshToken, user } = getStoredSession();
  if (!refreshToken) {
    throw new ApiError("Refresh token이 없습니다.", { status: 401 });
  }

  if (!refreshPromise) {
    refreshPromise = apiRequest("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      auth: false,
      skipRefresh: true,
    })
      .then((data) => {
        if (!data?.accessToken) {
          throw new ApiError("Access token 갱신 응답이 올바르지 않습니다.", { status: 401 });
        }
        saveAuthSession({ accessToken: data.accessToken, refreshToken, user });
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    signal,
    auth = true,
    query,
    skipRefresh = false,
  } = options;

  const session = getStoredSession();
  const requestHeaders = { ...headers };
  const requestOptions = {
    method,
    headers: requestHeaders,
    signal,
  };

  if (auth && session.accessToken) {
    requestHeaders.Authorization = `Bearer ${session.accessToken}`;
  }

  if (body !== undefined) {
    if (body instanceof FormData) {
      requestOptions.body = body;
    } else {
      requestHeaders["Content-Type"] = "application/json";
      requestOptions.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(buildUrl(path, query), requestOptions);
    return await parseResponse(response);
  } catch (error) {
    if (error.name === "AbortError") throw error;

    if (error instanceof ApiError && error.status === 401 && auth && !skipRefresh) {
      try {
        const nextToken = await refreshAccessToken();
        return await apiRequest(path, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${nextToken}`,
          },
          skipRefresh: true,
        });
      } catch (refreshError) {
        clearAuthSession();
        if (unauthorizedHandler) unauthorizedHandler(refreshError);
        throw refreshError;
      }
    }

    if (error instanceof ApiError) throw error;
    throw new ApiError("서버에 연결할 수 없습니다.", { isNetworkError: true });
  }
}

export const apiClient = {
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options) => apiRequest(path, { ...options, method: "POST", body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
};
