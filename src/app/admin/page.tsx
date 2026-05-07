"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tx, setTx] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [susp, setSusp] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    if (!(user.role === "admin" || user.role === "owner" || user.role === "officer")) {
      router.replace("/dashboard");
      return;
    }

    (async () => {
      setErr(null);
      try {
        if (user.role === "officer") {
          const s = await apiFetch<{ success: true; data: any[] }>("/api/admin/suspicious?limit=20&page=1", { method: "GET" });
          setSusp(s.data || []);
          return;
        }

        const [t, a, s] = await Promise.all([
          apiFetch<{ success: true; data: any[] }>("/api/admin/transactions?limit=20&page=1", { method: "GET" }),
          apiFetch<{ success: true; data: any[] }>("/api/admin/actions?limit=20&page=1", { method: "GET" }),
          apiFetch<{ success: true; data: any[] }>("/api/admin/suspicious?limit=20&page=1", { method: "GET" }),
        ]);
        setTx(t.data || []);
        setActions(a.data || []);
        setSusp(s.data || []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load admin data");
      }
    })();
  }, [user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-400">Admin Panel</div>
            <div className="text-lg font-semibold">{user.username}</div>
          </div>
          <button
            className="rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900"
            onClick={() => router.push("/dashboard")}
          >
            Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {err && (
          <div className="rounded-2xl border border-red-900 bg-red-950/40 px-4 py-3 text-red-200">
            {err}
          </div>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-semibold">Suspicious</div>
          <div className="mt-3 space-y-2 text-sm">
            {(susp || []).slice(0, 20).map((s: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-zinc-800 px-3 py-2">
                <div className="text-zinc-100">{s.user_id || "?"}</div>
                <div className="text-xs text-zinc-400">{s.issue} ({s.severity})</div>
              </div>
            ))}
            {(!susp || susp.length === 0) && <div className="text-zinc-400">No suspicious entries</div>}
          </div>
        </section>

        {(user.role === "admin" || user.role === "owner") && (
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="font-semibold">Recent Transactions</div>
              <div className="mt-3 space-y-2 text-sm">
                {(tx || []).slice(0, 20).map((t: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-zinc-800 px-3 py-2 flex items-center justify-between">
                    <div className="text-zinc-100">{t.type} {t.amount}</div>
                    <div className="text-xs text-zinc-400">{t.timestamp ? new Date(t.timestamp).toLocaleString() : ""}</div>
                  </div>
                ))}
                {(!tx || tx.length === 0) && <div className="text-zinc-400">No transactions</div>}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="font-semibold">Action Logs</div>
              <div className="mt-3 space-y-2 text-sm">
                {(actions || []).slice(0, 20).map((a: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-zinc-800 px-3 py-2 flex items-center justify-between">
                    <div className="text-zinc-100">{a.action}</div>
                    <div className="text-xs text-zinc-400">{a.last_time ? new Date(a.last_time).toLocaleString() : ""}</div>
                  </div>
                ))}
                {(!actions || actions.length === 0) && <div className="text-zinc-400">No actions</div>}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
