import { useEffect, useState } from "react";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";

function formatFileSize(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "크기 정보 없음";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export default function PublicationFilesModal({ publication, uploading, deletingId, onClose, onUpload, onDelete }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setFiles([]);
  }, [publication.id, publication.attachments]);

  const submitUpload = async (event) => {
    event.preventDefault();
    if (!files.length) return;
    const uploaded = await onUpload(files);
    if (uploaded) setFiles([]);
  };

  const attachments = publication.attachments || [];

  return (
    <Modal title="논문 파일 관리" description={publication.title} onClose={onClose} maxWidth={720}>
      <form className="publication-file-upload" onSubmit={submitUpload}>
        <label className="field">
          <span>파일 추가</span>
          <input
            key={files.map((file) => `${file.name}-${file.size}`).join("|") || "empty"}
            type="file"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
            disabled={uploading}
          />
        </label>
        {files.length ? (
          <ul className="file-draft-list">
            {files.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}
          </ul>
        ) : null}
        <div className="publication-file-upload-actions">
          {files.length ? <Button variant="ghost" size="sm" onClick={() => setFiles([])} disabled={uploading}>선택 해제</Button> : null}
          <Button type="submit" variant="primary" disabled={!files.length || uploading}>
            {uploading ? "업로드 중..." : "선택 파일 등록"}
          </Button>
        </div>
      </form>

      <section className="publication-attachment-section">
        <div className="publication-attachment-heading">
          <strong>등록된 파일</strong>
          <span>{attachments.length}개</span>
        </div>
        {attachments.length ? (
          <ul className="publication-attachment-list">
            {attachments.map((attachment) => (
              <li key={attachment.id}>
                <div>
                  <strong>{attachment.filename}</strong>
                  <span>{attachment.mime_type || "파일"} · {formatFileSize(attachment.filesize)}</span>
                </div>
                <div className="table-actions">
                  {attachment.file_url ? (
                    <Button size="sm" variant="secondary" onClick={() => window.open(attachment.file_url, "_blank", "noopener,noreferrer")}>
                      열기
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(attachment)}
                    disabled={Boolean(deletingId) || uploading}
                  >
                    {Number(deletingId) === Number(attachment.id) ? "삭제 중..." : "삭제"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="publication-attachment-empty">등록된 논문 파일이 없습니다.</p>
        )}
      </section>
    </Modal>
  );
}
