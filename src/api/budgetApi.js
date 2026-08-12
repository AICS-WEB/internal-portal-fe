import { apiClient } from "./client.js";
import { compactObject } from "./mappers.js";

export const budgetApi = {
  requestExpense: (values) =>
    apiClient.post(
      "/api/budget/expenses",
      compactObject({
        budgetId: Number(values.budgetId),
        category: values.category,
        itemName: values.itemName,
        amount: Number(values.amount),
        date: values.date,
        receipt: values.receiptFilename
          ? compactObject({
              filename: values.receiptFilename,
              storageType: values.receiptStorageType,
              fileUrl: values.receiptFileUrl,
              filepath: values.receiptFilepath,
              mimeType: values.receiptMimeType,
              filesize: values.receiptFilesize ? Number(values.receiptFilesize) : undefined,
            })
          : undefined,
      }),
    ),
  reviewExpense: (id, values) =>
    apiClient.put(`/api/budget/expenses/${id}/review`, {
      status: values.status,
      rejectReason: values.rejectReason,
    }),
};
