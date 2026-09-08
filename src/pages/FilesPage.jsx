import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import DataTable from "../components/DataTable.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { formatDateOnly } from "../utils/format.js";

const categoryOptions = [
  { value: "all", label: "전체" },
  { value: "paper", label: "논문" },
  { value: "presentation", label: "발표" },
  { value: "template", label: "템플릿" },
  { value: "software", label: "소프트웨어" },
  { value: "other", label: "기타" },
];

export default function FilesPage({ data, currentUser, actions }) {
  const [category, setCategory] = useState("all");

  const rows = useMemo(() => {
    return data.sharedFiles.filter((file) => category === "all" || file.category === category);
  }, [category, data.sharedFiles]);

  const columns = [
    {
      key: "title",
      header: "파일",
      render: (file) => (
        <div className="cell-main">
          <strong>{file.title}</strong>
          <span>{file.filename}</span>
        </div>
      ),
    },
    { key: "category", header: "카테고리", render: (file) => <Badge value={file.category} /> },
    { key: "min_role", header: "권한", render: (file) => <Badge value={file.min_role} /> },
    { key: "download_count", header: "다운로드" },
    { key: "uploaded_by_name", header: "등록자", render: (file) => file.uploaded_by_name || (String(file.uploaded_by) === String(currentUser.id) ? currentUser.name : "-") },
    { key: "uploaded_at", header: "업로드일", render: (file) => formatDateOnly(file.uploaded_at) },
    {
      key: "actions",
      header: "작업",
      render: (file) => {
        const allowed = actions.canAccess(file);
        const canEdit = actions.canEditOwned(file);
        return (
          <div className="table-actions">
            <Button size="sm" variant="secondary" onClick={() => actions.downloadFile(file)} disabled={!allowed}>
              다운로드
            </Button>
            {canEdit ? <Button size="sm" variant="secondary" onClick={() => actions.openEdit("sharedFiles", file)}>
              버전 업데이트
            </Button> : null}
            {canEdit ? <Button size="sm" variant="danger" onClick={() => actions.deleteItem("sharedFiles", file.id, "공용 파일")}>
              삭제
            </Button> : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-stack">
      <SectionHeader
        title="자료실"
        description="공용 자료와 템플릿 파일을 권한별로 관리합니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("sharedFiles")}>
            파일 업로드
          </Button>
        }
      />

      <section className="toolbar-panel">
        <FilterTabs options={categoryOptions} value={category} onChange={setCategory} />
      </section>

      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
