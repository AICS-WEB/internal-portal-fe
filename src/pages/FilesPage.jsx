import { useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import FilterTabs from "../components/FilterTabs.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

const categoryOptions = [
  { value: "all", label: "전체" },
  { value: "paper", label: "논문" },
  { value: "presentation", label: "발표" },
  { value: "template", label: "템플릿" },
  { value: "software", label: "소프트웨어" },
  { value: "other", label: "기타" },
];

export default function FilesPage({ data, actions }) {
  const [category, setCategory] = useState("all");

  const rows = useMemo(() => {
    return data.sharedFiles.filter((file) => category === "all" || file.category === category);
  }, [category, data.sharedFiles]);

  return (
    <div className="page-stack">
      <SectionHeader
        title="Files"
        description="연구실 문서, 템플릿, 소프트웨어 자료를 document library 형태로 정리합니다."
        actions={
          <Button variant="primary" onClick={() => actions.openCreate("sharedFiles")}>
            파일 업로드
          </Button>
        }
      />

      <section className="toolbar-panel">
        <FilterTabs options={categoryOptions} value={category} onChange={setCategory} />
      </section>

      <section className="document-list">
        {rows.map((file) => {
          const allowed = actions.canAccess(file);
          return (
            <article key={file.id} className={`document-item ${allowed ? "" : "disabled"}`}>
              <div className="document-main">
                <div className="notice-meta">
                  <Badge value={file.category} />
                  <Badge value={file.min_role} />
                  <span>{file.uploaded_at}</span>
                </div>
                <h2>{file.title}</h2>
                <p>{file.description}</p>
                <span className="filename">{file.filename}</span>
              </div>
              <div className="document-stats">
                <span>Version {file.version || "1.0"}</span>
                <span>{file.download_count} downloads</span>
              </div>
              <div className="item-actions quiet-actions">
                <Button size="sm" variant="secondary" onClick={() => actions.downloadFile(file)} disabled={!allowed}>
                  다운로드
                </Button>
                <Button size="sm" variant="secondary" onClick={() => actions.openEdit("sharedFiles", file)}>
                  버전 업데이트
                </Button>
                <Button size="sm" variant="danger" onClick={() => actions.deleteItem("sharedFiles", file.id, "공용 파일")}>
                  삭제
                </Button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
