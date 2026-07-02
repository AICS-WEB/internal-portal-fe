import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { currentTime, todayISO } from "../utils/format.js";
import { hasRole } from "../utils/permissions.js";

export default function AttendancePage({ data, currentUser, actions }) {
  const today = todayISO();
  const todayRecord = data.attendanceRecords.find((record) => record.user_id === currentUser.id && record.date === today);
  const todayRows = data.attendanceRecords.filter((record) => record.date === today);
  const canManage = hasRole(currentUser, "manager");

  const upsertToday = (patch) => {
    actions.updateCollection("attendanceRecords", (records) => {
      if (todayRecord) {
        return records.map((record) => (record.id === todayRecord.id ? { ...record, ...patch } : record));
      }
      return [
        {
          id: `att-${Date.now()}`,
          user_id: currentUser.id,
          user_name: currentUser.name,
          date: today,
          status: "present",
          check_in: "",
          check_out: "",
          memo: "",
          ...patch,
        },
        ...records,
      ];
    });
  };

  const openAttendanceEdit = (record = todayRecord) => {
    if (!record) {
      upsertToday({ status: "present", check_in: currentTime() });
      actions.showToast("오늘 출근 기록을 먼저 생성했습니다.");
      return;
    }
    actions.openForm({
      title: "출결 수정",
      fields: [
        { name: "status", label: "status", type: "select", options: ["present", "absent", "leave", "half_leave"] },
        { name: "check_in", label: "check_in", type: "text" },
        { name: "check_out", label: "check_out", type: "text" },
        { name: "memo", label: "memo", type: "textarea" },
      ],
      initialValues: record,
      submitLabel: "저장",
      successMessage: "출결 기록이 수정되었습니다.",
      onSubmit: (values) => actions.updateItem("attendanceRecords", record.id, values),
    });
  };

  const columns = [
    { key: "user_name", header: "이름" },
    { key: "date", header: "날짜" },
    { key: "status", header: "상태", render: (record) => <Badge value={record.status} /> },
    { key: "check_in", header: "출근" },
    { key: "check_out", header: "퇴근" },
    { key: "memo", header: "메모" },
    {
      key: "actions",
      header: "관리",
      render: (record) =>
        canManage ? (
          <div className="table-actions">
            <Button size="sm" variant="secondary" onClick={() => openAttendanceEdit(record)}>
              출결 수정
            </Button>
            <Button size="sm" variant="danger" onClick={() => actions.updateItem("attendanceRecords", record.id, { status: "absent", check_in: "", check_out: "" })}>
              결석 처리
            </Button>
          </div>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader title="Attendance" description="오늘 출결 상태와 최근 출결 기록을 관리합니다." />

      <section className="summary-grid three">
        <StatCard label="오늘 내 상태" value={todayRecord ? "기록 있음" : "기록 없음"} note={todayRecord?.status || "출근 전"} />
        <StatCard label="오늘 출석" value={`${todayRows.filter((record) => record.status === "present").length}명`} note="present 기준" tone="success" />
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
            <Button variant="primary" onClick={() => upsertToday({ status: "present", check_in: todayRecord?.check_in || currentTime() })}>
              출근
            </Button>
            <Button variant="secondary" onClick={() => upsertToday({ status: "present", check_out: currentTime() })}>
              퇴근
            </Button>
            {canManage ? (
              <>
                <Button variant="secondary" onClick={() => openAttendanceEdit()}>
                  출결 수정
                </Button>
                <Button variant="danger" onClick={() => upsertToday({ status: "absent", check_in: "", check_out: "" })}>
                  결석 처리
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <DataTable columns={columns} rows={data.attendanceRecords} />
    </div>
  );
}
