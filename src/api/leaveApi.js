import { apiClient } from "./client.js";

export const leaveApi = {
  requestLeave: (values) =>
    apiClient.post("/api/leave/requests", {
      leaveType: values.leaveType,
      halfPeriod: values.leaveType === "half" ? values.halfPeriod : undefined,
      startDate: values.startDate,
      endDate: values.endDate,
      reason: values.reason,
    }),
  reviewLeave: (id, values) =>
    apiClient.put(`/api/leave/requests/${id}/review`, {
      status: values.status,
      rejectReason: values.rejectReason,
    }),
};
