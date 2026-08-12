import { apiClient } from "./client.js";

export const attendanceApi = {
  checkIn: () => apiClient.post("/api/attendance/check-in"),
  checkOut: () => apiClient.post("/api/attendance/check-out"),
};
