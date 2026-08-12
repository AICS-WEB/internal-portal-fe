import { apiClient } from "./client.js";
import { serializeFile } from "./mappers.js";

export const filesApi = {
  listFiles: (query = {}, options) => apiClient.get("/api/files", { ...options, query }),
  getFile: (id, options) => apiClient.get(`/api/files/${id}`, options),
  createFile: (values) => apiClient.post("/api/files", serializeFile(values)),
  updateFile: (id, values) => apiClient.patch(`/api/files/${id}`, serializeFile(values)),
  deleteFile: (id) => apiClient.delete(`/api/files/${id}`),
  downloadFile: (id) => apiClient.get(`/api/files/${id}/download`),
};
