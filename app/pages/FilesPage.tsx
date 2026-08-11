"use client";
import { useCallback, useState } from "react";
import { Download, Plus } from "lucide-react";
import { api, BASE_URL, request } from "../lib/api";
import { isDemoMode } from "../lib/demoApi";
import { asArray, formatDate, useResource } from "../lib/hooks";
import { Button, EmptyState, ErrorState, Field, LoadingState, Modal, Notice, PageHeader } from "../components/ui";

export default function FilesPage() {
  const state = useResource(useCallback(() => api.files.list(), []));
  const items = asArray(state.data);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try { await request("/api/files", { method: "POST", body: new FormData(event.currentTarget) }); setOpen(false); await state.reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "업로드하지 못했습니다."); }
  }
  async function download(id: string, name: string) {
    try {
      if (isDemoMode()) {
        const url = URL.createObjectURL(new Blob([`AICS Lab UI Preview file\n${name}\n${id}`], { type: "text/plain" }));
        const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url); return;
      }
      const token = localStorage.getItem("aics_access_token");
      const response = await fetch(`${BASE_URL}/api/files/${id}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) throw new Error("다운로드하지 못했습니다.");
      const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "다운로드하지 못했습니다."); }
  }
  return <><PageHeader title="Files" description="연구실 문서와 공유 파일을 관리합니다." action={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={16}/>Upload</Button>}/>
    {error && <Notice tone="error">{error}</Notice>}
    {state.loading ? <LoadingState/> : state.error ? <ErrorState message={state.error} retry={state.reload}/> : items.length === 0 ? <EmptyState title="등록된 파일이 없습니다" description="업로드한 파일이 여기에 표시됩니다."/> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Category</th><th>Access</th><th>Version</th><th>Downloads</th><th>Updated</th><th/></tr></thead><tbody>{items.map((file,index) => <tr key={String(file.id || index)}><td><strong>{String(file.name || file.filename || "파일")}</strong></td><td>{String(file.category || "—")}</td><td>{String(file.access || file.visibility || "—")}</td><td>{String(file.version || "—")}</td><td>{String(file.downloads ?? "—")}</td><td>{formatDate(file.updatedAt)}</td><td><button className="icon-button" onClick={() => download(String(file.id), String(file.name || file.filename || "download"))} aria-label="다운로드"><Download size={17}/></button></td></tr>)}</tbody></table></div>}
    {open && <Modal title="Upload File" onClose={() => setOpen(false)}><form onSubmit={upload}><Field label="파일"><input name="file" type="file" required/></Field><Field label="분류"><input name="category"/></Field><Field label="접근 범위"><select name="access"><option value="lab">Lab</option><option value="manager">Manager</option><option value="private">Private</option></select></Field>{error && <Notice tone="error">{error}</Notice>}<div className="form-actions"><Button type="button" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary">Upload</Button></div></form></Modal>}
  </>;
}
