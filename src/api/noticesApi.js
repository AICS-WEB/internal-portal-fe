import { apiClient } from "./client.js";
import { listFrom, normalizeNotice, serializeNotice } from "./mappers.js";

export const noticesApi = {
  listNotices: async (query = {}, options) => {
    const data = await apiClient.get("/api/notices", { ...options, query });
    return listFrom(data, "notices").map(normalizeNotice);
  },
  getNotice: async (id, options) => {
    const data = await apiClient.get(`/api/notices/${id}`, options);
    return normalizeNotice(data?.notice || data);
  },
  createNotice: (values) => apiClient.post("/api/notices", serializeNotice(values)),
};
