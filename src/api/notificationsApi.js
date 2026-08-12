import { apiClient } from "./client.js";
import { normalizeNotification } from "./mappers.js";

export const notificationsApi = {
  listNotifications: async (query = {}, options) => {
    const data = await apiClient.get("/api/notifications", { ...options, query });
    return Array.isArray(data) ? data.map(normalizeNotification) : [];
  },
  getUnreadCount: (options) => apiClient.get("/api/notifications/unread-count", options),
  createNotification: (values) =>
    apiClient.post("/api/notifications", {
      userId: Number(values.userId),
      type: values.type,
      title: values.title,
      message: values.message,
      relatedType: values.relatedType || undefined,
      relatedId: values.relatedId ? Number(values.relatedId) : undefined,
    }),
  markAllRead: () => apiClient.patch("/api/notifications/read-all", {}),
  markRead: (id) => apiClient.patch(`/api/notifications/${id}/read`, {}),
};
