import { canAccess, hasRole } from "./permissions.js";
import { formatLabel } from "./format.js";

const sources = [
  ["notices", "notices", "공지", ["title", "content", "author", "category"]],
  ["calendarEvents", "calendar", "일정", ["title", "description", "location"]],
  ["researchProjects", "projects", "연구과제", ["title", "funding_agency", "program", "owner", "status"]],
  ["publications", "publications", "논문", ["title", "authors_text", "venue", "year", "status"]],
  ["sharedFiles", "files", "자료", ["title", "description", "filename"]],
  ["purchaseRequests", "purchases", "구매", ["item_name", "requester", "reason", "status"]],
  ["leaveRequests", "leave", "휴가", ["user_name", "leave_type", "start_date", "end_date", "status"]],
  ["attendanceRecords", "attendance", "출결", ["user_name", "date", "status"]],
  ["budgets", "budget", "예산", ["name", "fund_type", "status"]],
  ["expenses", "budget", "지출", ["item_name", "category", "date", "status"]],
  ["sharedCredentials", "credentials", "공용 계정", ["title", "category"]],
  ["users", "admin", "사용자", ["name", "department"]],
];

export function searchPortal(data, query, currentUser) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return sources.flatMap(([resource, page, category, fields]) => {
    if (page === "admin" && !hasRole(currentUser, "admin")) return [];
    return (data[resource] || []).filter((item) => canAccess(currentUser, item)).filter((item) => {
      const text = fields.map((field) => `${item[field] ?? ""} ${formatLabel(item[field], "")}`).join(" ").toLocaleLowerCase();
      return words.every((word) => text.includes(word));
    }).map((item) => ({ resource, page, category, item, title: item.title || item.item_name || item.name || `${item.user_name || ""} ${item.date || formatLabel(item.leave_type)}` }));
  });
}
