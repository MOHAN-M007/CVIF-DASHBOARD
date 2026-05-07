"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type UserRow = {
  user_id: string;
  username: string;
  role: string;
  minecraft_uuid: string | null;
  lock_until: string | null;
  web_password_set: boolean;
  created_at: string;
};

export default function OwnerUsersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load(nextPage = page) {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch<any>(
        `/api/owner/users?page=${nextPage}&limit=20&q=${encodeURIComponent(q)}`,
        { method: "GET" },
      );
      setData(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (e: any) {
      setErr(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-400">Owner Admin</div>
          <h1 className="text-2xl font-semibold mt-1">Users</h1>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
            placeholder="Search username / user_id / uuid"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            className="rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/60"
            onClick={() => {
              setPage(1);
              void load(1);
            }}
          >
            Search
          </button>
        </div>

        {err && (
          <div className="mt-3 rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="mt-4 overflow-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="text-zinc-400">
              <tr className="text-left">
                <th className="py-2 pr-4">Username</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">User ID</th>
                <th className="py-2 pr-4">UUID</th>
                <th className="py-2 pr-4">Locked</th>
                <th className="py-2 pr-4">Web Pass</th>
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
                    No users
                  </td>
                </tr>
              ) : (
                data.map((u) => (
                  <tr key={u.user_id} className="border-t border-zinc-800">
                    <td className="py-2 pr-4 text-zinc-100">
                      <Link className="hover:underline" href={`/admin/users/${encodeURIComponent(u.user_id)}`}>
                        {u.username}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-zinc-200">{u.role}</td>
                    <td className="py-2 pr-4 text-zinc-400">{u.user_id}</td>
                    <td className="py-2 pr-4 text-zinc-400">{u.minecraft_uuid || "—"}</td>
                    <td className="py-2 pr-4 text-zinc-400">{u.lock_until ? "yes" : "no"}</td>
                    <td className="py-2 pr-4 text-zinc-400">{u.web_password_set ? "set" : "not set"}</td>
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

