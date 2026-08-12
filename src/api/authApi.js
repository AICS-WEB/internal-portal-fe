import { apiClient, clearAuthSession, saveAuthSession } from "./client.js";

export const authApi = {
  register: (payload) => apiClient.post("/api/auth/register", payload, { auth: false }),
  login: async (payload) => {
    const data = await apiClient.post("/api/auth/login", payload, { auth: false });
    saveAuthSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
    return data;
  },
  refresh: (refreshToken) => apiClient.post("/api/auth/refresh", { refreshToken }, { auth: false, skipRefresh: true }),
  logout: async (refreshToken) => {
    try {
      if (refreshToken) await apiClient.post("/api/auth/logout", { refreshToken }, { auth: false, skipRefresh: true });
    } finally {
      clearAuthSession();
    }
  },
  requestPasswordReset: (email) => apiClient.post("/api/auth/password/reset-request", { email }, { auth: false }),
  resetPassword: ({ token, newPassword }) =>
    apiClient.post("/api/auth/password/reset", { token, newPassword }, { auth: false }),
};
