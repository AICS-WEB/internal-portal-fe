const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://aics-web-backend.onrender.com/api"
).replace(/\/$/, "");
const SESSION_KEY = "aics-auth-session";

async function postAuth(path, payload) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  const result = await response.json().catch(() => null);
  return { response, result };
}

export async function registerUser(payload) {
  const { response, result } = await postAuth("/auth/register", payload);

  if (!response.ok || !result?.success) {
    if (response.status === 409 && result?.message === "Email already registered.") {
      throw new Error("이미 가입된 이메일입니다.");
    }
    if (response.status === 409 && result?.message === "Student ID already registered.") {
      throw new Error("이미 가입된 학번입니다.");
    }
    throw new Error(result?.message || "회원가입 신청을 처리하지 못했습니다.");
  }

  return result.data;
}

export async function loginUser({ email, password }) {
  const { response, result } = await postAuth("/auth/login", { email, password });

  if (!response.ok || !result?.success) {
    if (response.status === 401) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
    if (response.status === 403) {
      throw new Error("관리자 승인 전이거나 비활성화된 계정입니다.");
    }
    throw new Error(result?.message || "로그인하지 못했습니다.");
  }

  return result.data;
}

export function saveAuthSession(session) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function readAuthSession() {
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
}
