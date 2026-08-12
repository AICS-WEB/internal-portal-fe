import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/authApi.js";
import { clearAuthSession, getStoredSession, saveAuthSession, setUnauthorizedHandler } from "../api/client.js";
import { usersApi } from "../api/usersApi.js";

const AuthContext = createContext(null);
const PREVIEW_KEY = "aics.lab.preview";
const PREVIEW_USER = {
  id: "preview",
  name: "UI Preview",
  email: "preview@local",
  role: "admin",
  account_status: "approved",
  department: "AICS Lab",
  program: "preview",
  isPreview: true,
};

function getPreviewStorage() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

function hasPreviewSession() {
  return getPreviewStorage()?.getItem(PREVIEW_KEY) === "active";
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    id: user.id ?? user.user_id,
    name: user.name || user.email || "사용자",
    role: user.role || "member",
    account_status: user.account_status || user.accountStatus || "approved",
    is_public_profile: user.is_public_profile ?? user.is_public ?? user.isPublic ?? false,
  };
}

function mergeUser(...users) {
  return normalizeUser(Object.assign({}, ...users.filter(Boolean)));
}

export function AuthProvider({ children }) {
  const stored = getStoredSession();
  const [isPreview, setIsPreview] = useState(() => hasPreviewSession());
  const [user, setUser] = useState(() => (hasPreviewSession() ? PREVIEW_USER : normalizeUser(stored.user)));
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");

  const replaceUser = useCallback((nextUser) => {
    setUser((current) => {
      const merged = mergeUser(current, nextUser);
      const session = getStoredSession();
      saveAuthSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: merged,
      });
      return merged;
    });
  }, []);

  const clearAuth = useCallback(() => {
    clearAuthSession();
    getPreviewStorage()?.removeItem(PREVIEW_KEY);
    setIsPreview(false);
    setUser(null);
  }, []);

  const enterPreview = useCallback(() => {
    clearAuthSession();
    getPreviewStorage()?.setItem(PREVIEW_KEY, "active");
    setIsPreview(true);
    setUser(PREVIEW_USER);
    setAuthError("");
    setAuthReady(true);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
      setAuthError("인증이 만료되었습니다. 다시 로그인해 주세요.");
    });
  }, [clearAuth]);

  useEffect(() => {
    if (isPreview) {
      setAuthReady(true);
      return undefined;
    }
    const session = getStoredSession();
    if (!session.accessToken) {
      setAuthReady(true);
      return undefined;
    }

    const controller = new AbortController();
    usersApi
      .getMe({ signal: controller.signal })
      .then((data) => {
        replaceUser(mergeUser(session.user, data?.user));
        setAuthError("");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        clearAuth();
        setAuthError(error.message || "인증 상태를 확인하지 못했습니다.");
      })
      .finally(() => setAuthReady(true));

    return () => controller.abort();
  }, [clearAuth, isPreview, replaceUser]);

  const login = useCallback(async (values) => {
    getPreviewStorage()?.removeItem(PREVIEW_KEY);
    setIsPreview(false);
    const data = await authApi.login(values);
    let nextUser = normalizeUser(data.user);
    try {
      const profile = await usersApi.getMe();
      nextUser = mergeUser(nextUser, profile?.user);
    } catch {
      // /me is minimal in the current backend; login payload still carries name/email/role.
    }
    saveAuthSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: nextUser,
    });
    setUser(nextUser);
    setAuthError("");
    return data;
  }, []);

  const logout = useCallback(async () => {
    if (isPreview) {
      getPreviewStorage()?.removeItem(PREVIEW_KEY);
      setIsPreview(false);
      setUser(null);
      return;
    }
    const { refreshToken } = getStoredSession();
    await authApi.logout(refreshToken);
    setUser(null);
  }, [isPreview]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(isPreview || (user && getStoredSession().accessToken)),
      isPreview,
      authReady,
      authError,
      login,
      logout,
      enterPreview,
      register: authApi.register,
      requestPasswordReset: authApi.requestPasswordReset,
      resetPassword: authApi.resetPassword,
      setAuthError,
      replaceUser,
      clearAuth,
    }),
    [authError, authReady, clearAuth, enterPreview, isPreview, login, logout, replaceUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
