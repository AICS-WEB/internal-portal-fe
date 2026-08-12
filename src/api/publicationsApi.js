import { apiClient } from "./client.js";
import { serializePublication } from "./mappers.js";

export const publicationsApi = {
  listPublications: (query = {}, options) => apiClient.get("/api/publications", { ...options, query }),
  getPublication: (id, options) => apiClient.get(`/api/publications/${id}`, options),
  createPublication: (values) => apiClient.post("/api/publications", serializePublication(values)),
  updatePublication: (id, values) => apiClient.patch(`/api/publications/${id}`, serializePublication(values)),
  deletePublication: (id) => apiClient.delete(`/api/publications/${id}`),
};
