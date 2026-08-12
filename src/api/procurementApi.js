import { apiClient } from "./client.js";

export const procurementApi = {
  requestProcurement: (values) =>
    apiClient.post("/api/procurement/requests", {
      itemName: values.itemName,
      quantity: Number(values.quantity),
      estimatedPrice: Number(values.estimatedPrice),
      purchaseUrl: values.purchaseUrl || undefined,
      reason: values.reason,
    }),
  reviewProcurement: (id, values) =>
    apiClient.put(`/api/procurement/requests/${id}/review`, {
      status: values.status,
      rejectReason: values.rejectReason,
    }),
  updateStatus: (id, values) =>
    apiClient.put(`/api/procurement/requests/${id}/status`, {
      status: values.status,
      expenseId: values.expenseId ? Number(values.expenseId) : undefined,
    }),
};
