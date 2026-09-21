import { formatDateOnly, formatLabel } from "./format.js";

export function projectStatus(status) {
  const value = String(status || "").trim();
  return /^closed(?:\s|$)/i.test(value) ? "closed" : value;
}

export function projectMonth(value) {
  const match = String(value || "").match(/^(\d{4})[-.](\d{2})(?:$|[-.T])/);
  return match && Number(match[2]) >= 1 && Number(match[2]) <= 12 ? `${match[1]}-${match[2]}` : "";
}

export function projectMonthPayload(value) {
  if (!value) return null;
  const month = projectMonth(value);
  if (!month) throw new Error("과제 기간을 올바른 연·월로 입력해 주세요.");
  return month.replace("-", ".");
}

export function projectStatusLabel(project) {
  const status = projectStatus(project.status);
  if (status.toLowerCase() !== "closed") return formatLabel(status);
  const date = formatDateOnly(project.end_date);
  return date === "-" ? "종료" : `종료 (${date.slice(0, 7)})`;
}

export function validateProject(values) {
  if (!values.title?.trim()) throw new Error("과제명을 입력해 주세요.");
  for (const [field, limit, label] of [["title", 300, "과제명"], ["funding_agency", 200, "지원기관"], ["program", 255, "사업명"], ["role", 100, "역할"], ["status", 50, "상태"]]) {
    if (String(values[field] || "").length > limit) throw new Error(`${label}은 ${limit}자 이내로 입력해 주세요.`);
  }
  if (values.start_date && values.end_date && values.start_date > values.end_date) throw new Error("종료일은 시작일 이후로 지정해 주세요.");
  if (!Number.isInteger(Number(values.display_order || 0))) throw new Error("표시 순서는 정수로 입력해 주세요.");
  return { ...values, title: values.title.trim(), status: projectStatus(values.status) };
}
