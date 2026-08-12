import { apiClient } from "./client.js";
import { serializeCalendarEvent } from "./mappers.js";

export const calendarApi = {
  listEvents: ({ start, end }, options) => apiClient.get("/api/calendar/events", { ...options, query: { start, end } }),
  getEvent: (id, options) => apiClient.get(`/api/calendar/events/${id}`, options),
  createEvent: (values) => apiClient.post("/api/calendar/events", serializeCalendarEvent(values)),
  updateEvent: (id, values) => apiClient.patch(`/api/calendar/events/${id}`, serializeCalendarEvent(values)),
  deleteEvent: (id) => apiClient.delete(`/api/calendar/events/${id}`),
  createException: (id, values) =>
    apiClient.post(`/api/calendar/events/${id}/exceptions`, {
      originalDate: values.originalDate,
      isCancelled: Boolean(values.isCancelled),
      newStart: values.newStart || undefined,
      newEnd: values.newEnd || undefined,
      newTitle: values.newTitle || undefined,
    }),
  splitRecurrence: (id, values) =>
    apiClient.post(`/api/calendar/events/${id}/split`, {
      untilDatetime: values.untilDatetime,
      startDatetime: values.startDatetime,
      endDatetime: values.endDatetime,
      title: values.title || undefined,
      description: values.description || undefined,
      location: values.location || undefined,
      isAllDay: Boolean(values.isAllDay),
      recurrenceRule: values.recurrenceRule || undefined,
    }),
};
