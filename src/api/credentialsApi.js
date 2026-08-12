import { apiClient } from "./client.js";
import { serializeCredential } from "./mappers.js";

export const credentialsApi = {
  listCredentials: (query = {}, options) => apiClient.get("/api/credentials", { ...options, query }),
  getCredential: (id, options) => apiClient.get(`/api/credentials/${id}`, options),
  createCredential: (values) => apiClient.post("/api/credentials", serializeCredential(values)),
  updateCredential: (id, values) => apiClient.patch(`/api/credentials/${id}`, serializeCredential(values)),
  deleteCredential: (id) => apiClient.delete(`/api/credentials/${id}`),
  revealPassword: (id) => apiClient.get(`/api/credentials/${id}/reveal`),
  logCopy: (id) => apiClient.post(`/api/credentials/${id}/copy`, {}),
};
