"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type StatsRes = {
  success: true;
  stats: {
    total_users: number;
    online_players: number;
    total_wallet_balance: number;
    total_bank_balance: number;
    total_shops: number;
    total_transactions: number;
  };
  recent_logins: any[];
  recent_announcements: any[];
  suspicious_summary: { generated_at: string; items: any[] };
};

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<StatsRes | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiFetch<StatsRes>("/api/owner/stats", { method: "GET" });
        if (!alive) return;
        setData(res);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load stats");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-400">CVIF • Owner Admin</div>
          <h1 className="text-2xl font-semibold mt-1">Overview</h1>
        </div>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-900 bg-red-950/40 px-4 py-3 text-red-200">
          {err}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card title="Total Users" value={loading ? "…" : data?.stats.total_users ?? "—"} />
        <Card title="Online (sessions)" value={loading ? "…" : data?.stats.online_players ?? "—"} />
        <Card title="Total Wallet" value={loading ? "…" : data?.stats.total_wallet_balance ?? "—"} />
        <Card title="Total Bank" value={loading ? "…" : data?.stats.total_bank_balance ?? "—"} />
        <Card title="Total Shops" value={loading ? "…" : data?.stats.total_shops ?? "—"} />
        <Card title="Total Transactions" value={loading ? "…" : data?.stats.total_transactions ?? "—"} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-semibold">Recent Logins</div>
          <div className="mt-3 space-y-2 text-sm">
            {loading ? (
              <div className="text-zinc-400">Loading…</div>
            ) : (data?.recent_logins || []).length === 0 ? (
              <div className="text-zinc-400">No logins</div>
            ) : (
              (data?.recent_logins || []).slice(0, 10).map((s: any, idx: number) => (
                <div key={idx} className="rounded-xl border border-zinc-800 px-3 py-2 flex justify-between">
                  <div className="text-zinc-100">{s.user_id}</div>
                  <div className="text-xs text-zinc-400">{s.created_at ? new Date(s.created_at).toLocaleString() : ""}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-semibold">Recent Announcements</div>
          <div className="mt-3 space-y-2 text-sm">
            {loading ? (
              <div className="text-zinc-400">Loading…</div>
            ) : (data?.recent_announcements || []).length === 0 ? (
              <div className="text-zinc-400">No announcements</div>
            ) : (
              (data?.recent_announcements || []).slice(0, 6).map((a: any) => (
                <div key={String(a.announcement_id)} className="rounded-xl border border-zinc-800 px-3 py-2">
                  <div className="text-zinc-100">{a.message}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

