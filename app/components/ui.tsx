"use client";
import { X, LoaderCircle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <header className="page-header"><div><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-actions">{action}</div>}</header>;
}
export function Button({ children, variant = "secondary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return <button className={`button ${variant}`} {...props}>{children}</button>;
}
export function Modal({ title, children, onClose, footer }: { title: string; children: ReactNode; onClose: () => void; footer?: ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="닫기"><X size={19}/></button></header><div className="modal-body">{children}</div>{footer && <footer>{footer}</footer>}</section></div>;
}
export function LoadingState() { return <div className="state"><LoaderCircle className="spin" size={20}/><span>불러오는 중입니다.</span></div>; }
export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="state empty"><strong>{title}</strong><span>{description}</span></div>; }
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) { return <div className="state error"><strong>{message}</strong>{retry && <Button onClick={retry}><RefreshCw size={15}/>다시 시도</Button>}</div>; }
export function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "error" }) { return <div className={`notice ${tone}`}>{children}</div>; }

