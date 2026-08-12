import { apiClient } from "./client.js";

export const usersApi = {
  getMe: (options) => apiClient.get("/api/users/me", options),
  getAdminDashboard: (options) => apiClient.get("/api/users/admin-dashboard", options),
};
