"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function OwnerLivePlayersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiFetch<any>("/api/owner/live-players?limit=50", { method: "GET" });
        if (!alive) return;
        setData(res.data || []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load live players");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    const t = setInterval(() => {
      void (async () => {
        try {
          const res = await apiFetch<any>("/api/owner/live-players?limit=50", { method: "GET" });
          if (!alive) return;
          setData(res.data || []);
        } catch {
          // ignore periodic errors
        }
      })();
    }, 10_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-zinc-400">Owner Admin</div>
        <h1 className="text-2xl font-semibold mt-1">Live Players</h1>
        <div className="text-xs text-zinc-500 mt-1">Shows active sessions (approx online). Refreshes every 10s.</div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        {err && (
          <div className="rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="mt-2 overflow-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="text-zinc-400">
              <tr className="text-left">
                <th className="py-2 pr-4">Username</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">User ID</th>
                <th className="py-2 pr-4">IP</th>
                <th className="py-2 pr-4">Login</th>
                <th className="py-2 pr-4">Expires</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-3 text-zinc-400" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td className="py-3 text-zinc-400" colSpan={6}>
                    No active sessions
                  </td>
                </tr>
              ) : (
                data.map((s: any, idx: number) => (
                  <tr key={idx} className="border-t border-zinc-800">
                    <td className="py-2 pr-4 text-zinc-100">{s.username || "—"}</td>
                    <td className="py-2 pr-4 text-zinc-300">{s.role || "—"}</td>
                    <td className="py-2 pr-4 text-zinc-400">{s.user_id}</td>
                    <td className="py-2 pr-4 text-zinc-400">{s.ip}</td>
                    <td className="py-2 pr-4 text-zinc-500">{s.created_at ? new Date(s.created_at).toLocaleString() : ""}</td>
                    <td className="py-2 pr-4 text-zinc-500">{s.expires_at ? new Date(s.expires_at).toLocaleString() : ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

