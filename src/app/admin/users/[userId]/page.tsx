"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type UserDetail = {
  user_id: string;
  username: string;
  role: "player" | "officer" | "admin" | "owner" | string;
  email?: string | null;
  minecraft_uuid?: string | null;
  lock_until?: string | null;
  created_at?: string;
  web_password_set?: boolean;
  ips?: string[];
};

function toNumberOrNull(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function OwnerUserDetailPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const userId = decodeURIComponent(params.userId);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  const user: UserDetail | null = useMemo(() => {
    if (!data) return null;
    return (data.user || data.data?.user || data) as UserDetail;
  }, [data]);

  const [role, setRole] = useState<string>("player");
  const [wallet, setWallet] = useState<string>("");
  const [bank, setBank] = useState<string>("");
  const [lockMinutes, setLockMinutes] = useState<string>("10");

  async function load() {
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const res = await apiFetch<any>(`/api/owner/users/${encodeURIComponent(userId)}`, { method: "GET" });
      setData(res);
      const u = (res.user || res.data?.user || res) as UserDetail;
      setRole(u.role || "player");
      setWallet(String(u.wallet_balance ?? u.wallet ?? ""));
      setBank(String(u.bank_balance_actual ?? u.bank_balance ?? ""));
    } catch (e: any) {
      setErr(e?.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function patch(body: any, successMsg: string) {
    setErr(null);
    setOk(null);
    try {
      await apiFetch(`/api/owner/user/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setOk(successMsg);
      await load();
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    }
  }

  async function del() {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setErr(null);
    setOk(null);
    try {
      await apiFetch(`/api/owner/user/${encodeURIComponent(userId)}`, { method: "DELETE" });
      router.push("/admin/users");
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-zinc-400">Owner Admin</div>
        <h1 className="text-2xl font-semibold mt-1">User</h1>
        <div className="mt-2 text-sm text-zinc-400 break-all">{userId}</div>
      </div>

      {err && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">{err}</div>
      )}
      {ok && (
        <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
          {ok}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-semibold">Profile</div>
          {loading ? (
            <div className="mt-3 text-sm text-zinc-400">Loading…</div>
          ) : !user ? (
            <div className="mt-3 text-sm text-zinc-400">Not found</div>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-zinc-400">Username</span>
                <span className="text-zinc-100">{user.username}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-zinc-400">Role</span>
                <span className="text-zinc-100">{user.role}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-zinc-400">UUID</span>
                <span className="text-zinc-100 break-all">{user.minecraft_uuid || "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-zinc-400">Locked</span>
                <span className="text-zinc-100">{user.lock_until ? "yes" : "no"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-zinc-400">Web Password</span>
                <span className="text-zinc-100">{user.web_password_set ? "set" : "not set"}</span>
              </div>
              <div className="pt-2">
                <button
                  className="rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/60"
                  onClick={() => router.push("/admin/users")}
                >
                  Back to list
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-semibold">Actions</div>
          <div className="mt-3 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs text-zinc-400">Role</div>
                <select
                  className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="player">player</option>
                  <option value="officer">officer</option>
                  <option value="admin">admin</option>
                  <option value="owner">owner</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex items-end gap-2">
                <button
                  className="flex-1 rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/60"
                  onClick={() => patch({ role }, "Role updated")}
                >
                  Update role
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs text-zinc-400">Wallet (absolute)</div>
                <input
                  className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="e.g. 0"
                />
              </div>
              <div>
                <div className="text-xs text-zinc-400">Bank (absolute)</div>
                <input
                  className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  placeholder="e.g. 0"
                />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <button
                  className="flex-1 rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/60"
                  onClick={() => {
                    const w = toNumberOrNull(wallet);
                    if (w === null || w < 0) return setErr("Invalid wallet amount");
                    void patch({ wallet_balance: w }, "Wallet updated");
                  }}
                >
                  Update wallet
                </button>
                <button
                  className="flex-1 rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/60"
                  onClick={() => {
                    const b = toNumberOrNull(bank);
                    if (b === null || b < 0) return setErr("Invalid bank amount");
                    void patch({ bank_balance: b }, "Bank updated");
                  }}
                >
                  Update bank
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs text-zinc-400">Lock minutes</div>
                <input
                  className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
                  value={lockMinutes}
                  onChange={(e) => setLockMinutes(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2 flex items-end gap-2">
                <button
                  className="flex-1 rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/60"
                  onClick={() => {
                    const m = toNumberOrNull(lockMinutes);
                    if (m === null || m <= 0) return setErr("Invalid lock minutes");
                    // backend uses "locked" boolean; minutes are informational only
                    void patch({ locked: true }, "User locked");
                  }}
                >
                  Lock
                </button>
                <button
                  className="flex-1 rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/60"
                  onClick={() => patch({ locked: false }, "User unlocked")}
                >
                  Unlock
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/60"
                onClick={() => {
                  if (!confirm("Reset website password? (User will need to set it again)")) return;
                  void patch({ reset_web_password: true }, "Website password reset");
                }}
              >
                Reset web password
              </button>
              <button
                className="rounded-xl border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200 hover:bg-red-950/50"
                onClick={del}
              >
                Delete user
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-semibold">Recent Sessions</div>
          <div className="mt-3 text-sm text-zinc-300">
            {(data?.sessions || []).length === 0 ? (
              <div className="text-zinc-400">No sessions</div>
            ) : (
              <div className="space-y-2">
                {(data.sessions as any[]).slice(0, 10).map((s) => (
                  <div key={String(s._id || s.session_token)} className="rounded-xl border border-zinc-800 px-3 py-2">
                    <div className="text-zinc-100 break-all">{String(s.ip || "—")}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {s.created_at ? new Date(s.created_at).toLocaleString() : ""} •{" "}
                      {s.expires_at ? new Date(s.expires_at).toLocaleString() : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-semibold">Recent Audit</div>
          <div className="mt-3 text-sm text-zinc-300">
            {(data?.audit || []).length === 0 ? (
              <div className="text-zinc-400">No audit logs</div>
            ) : (
              <div className="space-y-2">
                {(data.audit as any[]).slice(0, 10).map((l) => (
                  <div key={String(l._id)} className="rounded-xl border border-zinc-800 px-3 py-2">
                    <div className="text-zinc-100">{l.action || "action"}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {l.actor_username || "system"} • {l.timestamp ? new Date(l.timestamp).toLocaleString() : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
