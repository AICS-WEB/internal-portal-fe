import { apiClient } from "./client.js";
import { compactObject } from "./mappers.js";

export const applicationsApi = {
  submitApplication: (values) =>
    apiClient.post(
      "/api/public/applications",
      compactObject({
        targetTerm: values.targetTerm,
        name: values.name,
        email: values.email,
        phone: values.phone,
        studentId: values.studentId,
        department: values.department,
        grade: values.grade,
        interestArea: values.interestArea,
        introduction: values.introduction,
        githubUrl: values.githubUrl,
        portfolioUrl: values.portfolioUrl,
        privacyConsent: Boolean(values.privacyConsent),
      }),
      { auth: false },
    ),
  listApplications: (query = {}, options) => apiClient.get("/api/applications", { ...options, query }),
  getApplication: (id, options) => apiClient.get(`/api/applications/${id}`, options),
  updateApplication: (id, values) =>
    apiClient.patch(`/api/applications/${id}`, {
      status: values.status,
      internalMemo: values.internalMemo,
      isRead: values.isRead,
    }),
  deleteApplication: (id) => apiClient.delete(`/api/applications/${id}`),
};
