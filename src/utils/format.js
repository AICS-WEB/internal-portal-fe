export function formatCurrency(value) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("ko-KR").format(Number(value) || 0);
}

const labelMap = {
  general: "일반", important: "중요", account_info: "계정 안내", schedule: "일정",
  meeting: "회의", deadline: "마감", event: "행사", trip: "출장", other: "기타",
  shared: "공유", personal: "개인", present: "출석", late: "지각", absent: "결석",
  leave: "휴가", half_leave: "반차", pending: "대기", approved: "승인",
  rejected: "반려", deactivated: "비활성", purchased: "구매 완료", delivered: "입고 완료",
  active: "진행 중", completed: "완료", closed: "종료", watch: "주의",
  writing: "작성 중", submitted: "제출", under_review: "심사 중", accepted: "채택",
  published: "게재 완료", paper: "논문", presentation: "발표 자료", template: "서식",
  software: "소프트웨어", member: "일반 구성원", manager: "관리자", admin: "최고 관리자",
  research: "연구비", department: "학과 운영비", operation: "운영비", conference: "학회",
  equipment: "장비", office: "사무용품", infra: "인프라", billing: "결제",
  library: "라이브러리", personnel: "인건비", activity: "활동비", material: "재료비",
  annual: "연차", half: "반차", half_day: "반차", sick: "병가", am: "오전", pm: "오후",
  public: "공개", private: "비공개", sci: "SCI급 국제학술지", kci: "KCI 등재지",
  intl_conf: "국제학술대회", domestic_conf: "국내학술대회", wifi: "무선 네트워크",
  server: "서버", cloud: "클라우드", license: "라이선스", notice_created: "새 공지",
  undergrad: "학부", master: "석사", phd: "박사", professor: "교수",
  ko: "한국어", en: "영어", male: "남성", female: "여성",
  leave_requested: "휴가 신청", leave_approved: "휴가 승인", leave_rejected: "휴가 반려",
  purchase_requested: "구매 신청", purchase_approved: "구매 승인", purchase_rejected: "구매 반려",
  purchase_purchased: "구매 완료", purchase_delivered: "입고 완료",
  expense_requested: "지출 신청", expense_approved: "지출 승인", expense_rejected: "지출 반려",
};

export function formatLabel(value, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  const key = String(value).toLowerCase();
  return labelMap[key] || String(value);
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const text = String(value);
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00+09:00` : text;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateOnly(value) {
  if (!value) return "-";
  const date = parseDate(value);
  if (!date) return String(value);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date).replace(/\.\s*/g, ".").replace(/\.$/, "");
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = parseDate(value);
  if (!date) return String(value);
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}.${part("month")}.${part("day")} ${part("hour")}:${part("minute")}`;
}

export function formatDate(value) {
  return String(value || "").includes("T") ? formatDateTime(value) : formatDateOnly(value);
}

export function formatDateRange(start, end) {
  const first = formatDateOnly(start);
  const last = formatDateOnly(end);
  return first === last ? first : `${first} ~ ${last}`;
}

export function toDateTimeInput(value) {
  const date = parseDate(value);
  if (!date) return value ? String(value).slice(0, 16) : "";
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}
