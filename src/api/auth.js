import { apiRequest, clearSession, readSession, saveSession } from "./client.js";

export async function registerUser(payload) {
  try {
    return await apiRequest("/auth/register", { method: "POST", body: payload, auth: false });
  } catch (error) {
    if (error.status === 409 && error.message === "Email already registered.") throw new Error("이미 가입된 이메일입니다.");
    if (error.status === 409 && error.message === "Student ID already registered.") throw new Error("이미 가입된 학번입니다.");
    throw new Error(error.message || "회원가입 신청을 처리하지 못했습니다.");
  }
}

export async function loginUser({ email, password }) {
  try {
    return await apiRequest("/auth/login", { method: "POST", body: { email, password }, auth: false });
  } catch (error) {
    if (error.status === 401) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    if (error.status === 403) throw new Error("관리자 승인 전이거나 비활성화된 계정입니다.");
    throw new Error(error.message || "로그인하지 못했습니다.");
  }
}

export async function logoutUser(refreshToken) {
  if (!refreshToken) return;
  await apiRequest("/auth/logout", { method: "POST", body: { refreshToken }, auth: false });
}

export function saveAuthSession(session) {
  saveSession(session);
}

export function readAuthSession() {
  return readSession();
}

export function clearAuthSession() {
  clearSession();
}
