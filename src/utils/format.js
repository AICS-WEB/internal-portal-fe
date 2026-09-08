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
  title: "제목", category: "분류", content: "내용", description: "설명",
  is_pinned: "상단 고정", event_type: "일정 유형", scope: "공개 범위",
  start_datetime: "시작 일시", end_datetime: "종료 일시", location: "장소",
  is_recurring: "반복 일정", recurrence_rule: "반복 규칙", leave_type: "휴가 유형",
  half_period: "반차 시간", start_date: "시작일", end_date: "종료일", reason: "사유",
  authors_text: "전체 저자", year: "게재 연도", published_date: "게재일",
  pub_type: "논문 유형", status: "상태", venue: "게재지", doi: "DOI",
  is_public: "공개 여부", min_role: "열람 권한", filename: "파일명",
  file_url: "파일 주소", mime_type: "파일 형식", filesize: "파일 크기",
  item_name: "품목명", quantity: "수량", estimated_price: "예상 금액",
  purchase_url: "구매 주소", fund_type: "재원 구분", amount: "금액", date: "일자",
  username: "아이디", password: "비밀번호", url: "주소", memo: "메모",
  student_id: "학번", department: "소속", program: "과정",
  enrollment_year: "입학 연도", research_topic: "연구 주제",
  github_url: "GitHub 주소", linkedin_url: "LinkedIn 주소", phone: "연락처",
  preferred_language: "선호 언어", check_in: "출근 시간", check_out: "퇴근 시간",
  id: "번호", name: "이름", email: "이메일", role: "역할", account_status: "계정 상태",
  author: "작성자", views: "조회수", attachments: "첨부파일", authors: "저자",
  created_at: "작성일", updated_at: "수정일", requested_at: "신청일", uploaded_at: "업로드일",
  last_login_at: "최근 로그인", profile_image: "프로필 이미지", bio: "소개",
  general: "일반", important: "중요", account_info: "계정 안내", schedule: "일정",
  meeting: "회의", deadline: "마감", event: "행사", trip: "출장", other: "기타",
  shared: "공유", personal: "개인", present: "출석", late: "지각", absent: "결석",
  leave: "휴가", half_leave: "반차", pending: "대기", approved: "승인",
  rejected: "반려", deactivated: "비활성", purchased: "구매 완료", delivered: "입고 완료",
  active: "진행 중", completed: "완료", closed: "종료", watch: "주의",
  writing: "작성 중", submitted: "제출", under_review: "심사 중", accepted: "채택",
  published: "게재 완료", paper: "논문", presentation: "발표 자료", template: "서식",
  software: "소프트웨어", member: "일반 구성원", manager: "관리자", admin: "최고 관리자",
  research: "연구비", department_fund: "학과 운영비",
  operation: "운영비", conference: "학회", equipment: "장비", office: "사무용품",
  infra: "인프라", billing: "결제", library: "라이브러리", personnel: "인건비",
  activity: "활동비", material: "재료비", annual: "연차", half: "반차",
  half_day: "반차", sick: "병가", am: "오전", pm: "오후", public: "공개",
  private: "비공개", sci: "SCI급 국제학술지", kci: "KCI 등재지",
  intl_conf: "국제학술대회", domestic_conf: "국내학술대회", wifi: "무선 네트워크",
  server: "서버", cloud: "클라우드", license: "라이선스", undergrad: "학부",
  master: "석사", phd: "박사", professor: "교수", ko: "한국어", en: "영어",
  male: "남성", female: "여성",
  notice_created: "새 공지", leave_requested: "휴가 신청", purchase_requested: "구매 신청",
  unknown: "미정",
};

export function formatLabel(value, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  const key = String(value).trim().toLowerCase();
  return labelMap[key] || String(value);
}

export function formatDate(value) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
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
