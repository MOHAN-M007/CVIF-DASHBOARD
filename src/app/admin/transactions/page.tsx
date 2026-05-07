"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

function toCsv(rows: any[]) {
  if (!rows || rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    const q = s.replace(/\"/g, "\"\"");
    return `"${q}"`;
  };
  const lines = [keys.join(",")].concat(rows.map((r) => keys.map((k) => esc(r[k])).join(",")));
  return lines.join("\n");
}

export default function OwnerTransactionsPage() {
  const [type, setType] = useState<"all" | "economy" | "bank" | "shop">("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch<any>(`/api/owner/transactions?type=${type}&page=${page}&limit=20`, { method: "GET" });
      setData(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (e: any) {
      setErr(e?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, page]);

  const csv = useMemo(() => toCsv(data), [data]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-zinc-400">Owner Admin</div>
        <h1 className="text-2xl font-semibold mt-1">Transactions</h1>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value as any);
            }}
          >
            <option value="all">All</option>
            <option value="economy">Economy</option>
            <option value="bank">Bank</option>
            <option value="shop">Shop</option>
          </select>
          <button
            className="rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/60"
            onClick={() => {
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `cvif-transactions-${type}-page-${page}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV (page)
          </button>
        </div>

        {err && (
          <div className="mt-3 rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="mt-4 overflow-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="text-zinc-400">
              <tr className="text-left">
                <th className="py-2 pr-4">Kind</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Time</th>
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
                    No transactions
                  </td>
                </tr>
              ) : (
                data.map((t: any, idx: number) => (
                  <tr key={idx} className="border-t border-zinc-800">
                    <td className="py-2 pr-4 text-zinc-300">{t._kind || type}</td>
                    <td className="py-2 pr-4 text-zinc-100">{t.type || t.source || "—"}</td>
                    <td className="py-2 pr-4 text-zinc-400">{t.user_id || "—"}</td>
                    <td className="py-2 pr-4 text-zinc-200">{t.amount ?? "—"}</td>
                    <td className="py-2 pr-4 text-zinc-500">{t.timestamp ? new Date(t.timestamp).toLocaleString() : ""}</td>
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

