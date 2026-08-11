"use client";
import { useCallback, useEffect, useState } from "react";

export function useResource<T>(loader: () => Promise<T>, enabled = true) {
  const [data, setData] = useState<T | null>(null); const [loading, setLoading] = useState(enabled); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { setData(await loader()); } catch (e) { setError(e instanceof Error ? e.message : "요청을 처리하지 못했습니다."); } finally { setLoading(false); } }, [loader]);
  useEffect(() => { if (enabled) void load(); }, [enabled, load]);
  return { data, loading, error, reload: load, setData };
}
export function asArray(value: unknown): Record<string, any>[] { if (Array.isArray(value)) return value as Record<string, any>[]; const record = value as Record<string, unknown> | null; return (record && (record.items || record.events || record.results) as Record<string, any>[]) || []; }
export function formatDate(value: unknown) { if (!value) return "—"; const d = new Date(String(value)); return Number.isNaN(d.getTime()) ? String(value) : new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(d); }

