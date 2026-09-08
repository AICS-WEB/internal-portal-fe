import { useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { formatDateOnly, formatLabel, todayISO } from "../utils/format.js";
import { hasRole } from "../utils/permissions.js";

export default function AttendancePage({ data, currentUser, actions }) {
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showAll, setShowAll] = useState(false);
  const todayRecord = data.attendanceRecords.find((record) => record.user_id === currentUser.id && record.date === today);
  const todayRows = data.attendanceRecords.filter((record) => record.date === today);
  const canManage = hasRole(currentUser, "manager");

  const openAttendanceEdit = (record) => {
    actions.openForm({
      title: "출결 수정",
      fields: [
        { name: "status", label: "출결 상태", type: "select", options: [
          { value: "present", label: "출석" }, { value: "late", label: "지각" },
          { value: "absent", label: "결석" }, { value: "leave", label: "휴가" },
          { value: "half_leave", label: "반차" },
        ] },
        { name: "check_in", label: "출근 시간", type: "time" },
        { name: "check_out", label: "퇴근 시간", type: "time" },
      ],
      initialValues: record,
      submitLabel: "저장",
      successMessage: "출결 기록이 수정되었습니다.",
      onSubmit: (values) => actions.updateAttendance(record, values),
    });
  };

  const markAbsent = async (record) => {
    try {
      await actions.updateAttendance(record, { status: "absent", check_in: "", check_out: "" });
      actions.showToast("결석 처리되었습니다.");
    } catch (error) {
      actions.showToast(error.message, "error");
    }
  };

  const columns = [
    { key: "user_name", header: "이름" },
    { key: "date", header: "날짜", render: (record) => formatDateOnly(record.date) },
    { key: "status", header: "상태", render: (record) => <Badge value={record.status} /> },
    { key: "check_in", header: "출근" },
    { key: "check_out", header: "퇴근" },
    {
      key: "actions",
      header: "관리",
      render: (record) => canManage ? (
        <div className="table-actions">
          <Button size="sm" variant="secondary" onClick={() => openAttendanceEdit(record)}>출결 수정</Button>
          <Button size="sm" variant="danger" onClick={() => markAbsent(record)}>결석 처리</Button>
        </div>
      ) : "-",
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader title="출결" description="오늘 출결 상태와 날짜별 출결 기록을 관리합니다." />

      <section className="summary-grid three">
        <StatCard label="오늘 내 상태" value={todayRecord ? "기록 있음" : "기록 없음"} note={todayRecord ? formatLabel(todayRecord.status) : "출근 전"} />
        <StatCard label="오늘 출석" value={`${todayRows.filter((record) => ["present", "late"].includes(record.status)).length}명`} note="출석·지각 포함" tone="success" />
        <StatCard label="휴가/반차" value={`${todayRows.filter((record) => ["leave", "half_leave"].includes(record.status)).length}명`} note="오늘 기준" tone="warning" />
      </section>

      <section className="panel">
        <div className="attendance-actions">
          <div className="attendance-card">
            <Badge value={todayRecord?.status || "absent"} />
            <strong>{todayRecord?.check_in ? `${todayRecord.check_in} 출근` : "아직 출근 전입니다."}</strong>
            <p>{todayRecord?.check_out ? `${todayRecord.check_out} 퇴근` : "퇴근 기록은 버튼으로 남길 수 있습니다."}</p>
          </div>
          <div className="button-row">
            <Button variant="primary" onClick={() => actions.handleAttendance("in")} disabled={Boolean(todayRecord?.check_in)}>
              출근
            </Button>
            <Button variant="secondary" onClick={() => actions.handleAttendance("out")} disabled={!todayRecord?.check_in || Boolean(todayRecord?.check_out)}>
              퇴근
            </Button>
          </div>
        </div>
      </section>

      <section className="toolbar-panel attendance-date-filter">
        <label className="field">
          <span>조회 날짜</span>
          <input type="date" value={selectedDate} disabled={showAll} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>
        <Button variant={showAll ? "primary" : "secondary"} onClick={() => setShowAll((value) => !value)}>
          {showAll ? "선택 날짜만 보기" : "전체 기록 보기"}
        </Button>
      </section>
      <DataTable columns={columns} rows={showAll ? data.attendanceRecords : data.attendanceRecords.filter((record) => record.date === selectedDate)} />
    </div>
  );
}
