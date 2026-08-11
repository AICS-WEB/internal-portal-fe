const PREFIX = "aics_demo_";
type Row = Record<string, unknown> & { id?: string };

function read(name: string): Row[] { try { return JSON.parse(localStorage.getItem(PREFIX + name) || "[]") as Row[]; } catch { return []; } }
function write(name: string, rows: Row[]) { localStorage.setItem(PREFIX + name, JSON.stringify(rows)); }
function makeId() { return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function payload(body: BodyInit | null | undefined): Row {
  if (body instanceof FormData) { const result: Row = {}; body.forEach((value, key) => { result[key] = value instanceof File ? value.name : value; }); return result; }
  if (typeof body === "string") { try { return JSON.parse(body) as Row; } catch { return {}; } }
  return {};
}
function collectionFor(path: string) {
  if (path.startsWith("/api/calendar/events")) return "calendar"; if (path.startsWith("/api/notices")) return "notices";
  if (path.startsWith("/api/publications")) return "publications"; if (path.startsWith("/api/files")) return "files";
  if (path.startsWith("/api/credentials")) return "credentials"; if (path.startsWith("/api/notifications")) return "notifications";
  if (path.startsWith("/api/applications")) return "applications"; if (path.startsWith("/api/leave/requests")) return "leave";
  if (path.startsWith("/api/procurement/requests")) return "purchases"; if (path.startsWith("/api/budget/expenses")) return "budget"; return "";
}
export function isDemoMode() { return typeof window !== "undefined" && sessionStorage.getItem("aics_preview_mode") === "1"; }

export async function demoRequest<T>(rawPath: string, options: RequestInit = {}): Promise<T> {
  const path = rawPath.split("?")[0]; const method = (options.method || "GET").toUpperCase(); const body = payload(options.body);
  if (path === "/api/users/me") return { id: "preview", name: "UI Preview", email: "preview@local", role: "admin", department: "AICS Lab" } as T;
  if (path === "/api/users/admin-dashboard") return { applications: read("applications").length, notices: read("notices").length, events: read("calendar").length } as T;
  if (path === "/api/attendance/check-in" || path === "/api/attendance/check-out") return { type: path.endsWith("check-in") ? "check-in" : "check-out", recordedAt: new Date().toISOString() } as T;
  if (path === "/api/notifications/unread-count") return { count: read("notifications").filter(row => !row.read && !row.isRead).length } as T;
  if (path === "/api/notifications/read-all" && method === "PATCH") { const next = read("notifications").map(row => ({ ...row, read: true })); write("notifications", next); return { updated: next.length } as T; }
  const collection = collectionFor(path); if (!collection) return { preview: true } as T;
  const rows = read(collection); const parts = path.split("/").filter(Boolean); const rowId = parts.find(part => part.startsWith("demo-")); const action = parts.at(-1);
  if (collection === "credentials" && rowId && (action === "reveal" || action === "copy")) { const row = rows.find(item => item.id === rowId); return { password: row?.password || "" } as T; }
  if (collection === "notifications" && rowId && action === "read") { const next = rows.map(row => row.id === rowId ? { ...row, read: true } : row); write(collection, next); return next.find(row => row.id === rowId) as T; }
  if (method === "GET") return (rowId ? rows.find(row => row.id === rowId) : rows) as T;
  if (method === "POST") { const row: Row = { ...body, id: makeId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; write(collection, [row, ...rows]); return row as T; }
  if ((method === "PATCH" || method === "PUT") && rowId) { const next = rows.map(row => row.id === rowId ? { ...row, ...body, updatedAt: new Date().toISOString() } : row); write(collection, next); return next.find(row => row.id === rowId) as T; }
  if (method === "DELETE" && rowId) { write(collection, rows.filter(row => row.id !== rowId)); return { id: rowId, deleted: true } as T; }
  return { preview: true } as T;
}
