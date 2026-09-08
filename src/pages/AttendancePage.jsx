import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { todayISO } from "../utils/format.js";
import { hasRole } from "../utils/permissions.js";

export default function AttendancePage({ data, currentUser, actions }) {
  const today = todayISO();
  const todayRecord = data.attendanceRecords.find((record) => record.user_id === currentUser.id && record.date === today);
  const todayRows = data.attendanceRecords.filter((record) => record.date === today);
  const canManage = hasRole(currentUser, "manager");

  const openAttendanceEdit = (record) => {
    actions.openForm({
      title: "출결 수정",
      fields: [
        { name: "status", label: "status", type: "select", options: ["present", "late", "absent", "leave", "half_leave"] },
        { name: "check_in", label: "check_in", type: "time" },
        { name: "check_out", label: "check_out", type: "time" },
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
    { key: "date", header: "날짜" },
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
      <SectionHeader title="Attendance" description="오늘 출결 상태와 최근 출결 기록을 관리합니다." />

      <section className="summary-grid three">
        <StatCard label="오늘 내 상태" value={todayRecord ? "기록 있음" : "기록 없음"} note={todayRecord?.status || "출근 전"} />
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

      <DataTable columns={columns} rows={data.attendanceRecords} />
    </div>
  );
}
