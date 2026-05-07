"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function OwnerLogsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiFetch<any>(`/api/owner/logs?page=${page}&limit=20`, { method: "GET" });
        if (!alive) return;
        setData(res.data || []);
        setTotal(res.pagination?.total || 0);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load logs");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-zinc-400">Owner Admin</div>
        <h1 className="text-2xl font-semibold mt-1">Audit Logs</h1>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        {err && (
          <div className="rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="mt-2 overflow-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="text-zinc-400">
              <tr className="text-left">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Actor</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2 pr-4">Meta</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-3 text-zinc-400" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td className="py-3 text-zinc-400" colSpan={5}>
                    No logs
                  </td>
                </tr>
              ) : (
                data.map((l: any, idx: number) => (
                  <tr key={idx} className="border-t border-zinc-800">
                    <td className="py-2 pr-4 text-zinc-500">
                      {l.timestamp ? new Date(l.timestamp).toLocaleString() : ""}
                    </td>
                    <td className="py-2 pr-4 text-zinc-100">{l.actor_username || l.actor_user_id}</td>
                    <td className="py-2 pr-4 text-zinc-200">{l.action}</td>
                    <td className="py-2 pr-4 text-zinc-400">{l.target_username || l.target_user_id || "—"}</td>
                    <td className="py-2 pr-4 text-zinc-500">
                      <pre className="text-xs whitespace-pre-wrap break-words max-w-[420px]">
                        {l.meta ? JSON.stringify(l.meta) : ""}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
          <div>
            Page {page} • Total {total}
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-zinc-800 px-2 py-1 hover:bg-zinc-800/60 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="rounded-lg border border-zinc-800 px-2 py-1 hover:bg-zinc-800/60 disabled:opacity-50"
              disabled={page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

