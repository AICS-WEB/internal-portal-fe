function formatFileSize(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "크기 정보 없음";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function normalizeFile(file, index) {
  if (typeof file === "string") return { id: index, filename: file.split("/").pop() || "첨부파일", fileUrl: file, mimeType: "" };
  return {
    id: file?.id ?? index,
    filename: file?.filename || file?.name || `첨부파일 ${index + 1}`,
    fileUrl: file?.file_url || file?.fileUrl || file?.url || "",
    mimeType: file?.mime_type || file?.mimeType || "",
    filesize: file?.filesize || file?.fileSize || file?.size,
  };
}

function fileKind(file) {
  const source = `${file.mimeType} ${file.filename}`.toLowerCase();
  if (source.includes("image") || /\.(png|jpe?g|gif|webp|svg)$/.test(source)) return "이미지";
  if (source.includes("pdf") || source.endsWith(".pdf")) return "PDF";
  return "파일";
}

export default function FileAttachmentList({ files, emptyMessage = "첨부파일이 없습니다.", previewImages = false }) {
  const items = (Array.isArray(files) ? files : files ? [files] : []).map(normalizeFile);
  if (!items.length) return <p className="attachment-empty">{emptyMessage}</p>;

  return (
    <ul className="detail-attachment-list">
      {items.map((file) => {
        const kind = fileKind(file);
        return (
          <li key={file.id}>
            {previewImages && kind === "이미지" && file.fileUrl ? <img src={file.fileUrl} alt={`${file.filename} 미리보기`} /> : null}
            <div className="detail-attachment-copy">
              <span className={`file-kind file-kind-${kind === "이미지" ? "image" : kind === "PDF" ? "pdf" : "other"}`}>{kind}</span>
              <strong>{file.filename}</strong>
              <small>{file.mimeType || kind} · {formatFileSize(file.filesize)}</small>
            </div>
            {file.fileUrl ? <a className="btn btn-secondary btn-sm" href={file.fileUrl} target="_blank" rel="noreferrer">열기</a> : null}
          </li>
        );
      })}
    </ul>
  );
}
