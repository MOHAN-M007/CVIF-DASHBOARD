"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type Ann = {
  announcement_id: string;
  message: string;
  pinned?: boolean;
  priority?: number;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

function parseLocalDatetimeToISO(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function toLocalDatetimeInputValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function OwnerAnnouncementsPage() {
  const [createMessage, setCreateMessage] = useState("");
  const [createPinned, setCreatePinned] = useState(false);
  const [createPriority, setCreatePriority] = useState(0);
  const [createExpiresAt, setCreateExpiresAt] = useState("");

  const [data, setData] = useState<Ann[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      const pa = Number(a.priority || 0);
      const pb = Number(b.priority || 0);
      if (pa !== pb) return pb - pa;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [data]);

  async function load() {
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const res = await apiFetch<{ success: true; data: Ann[] }>("/api/owner/announcements?limit=100", { method: "GET" });
      setData(res.data || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-zinc-400">Owner Admin</div>
        <h1 className="text-2xl font-semibold mt-1">Announcements</h1>
      </div>

      {ok && (
        <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
          {ok}
        </div>
      )}
      {err && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">{err}</div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="font-semibold">Create</div>
        <div className="mt-3 space-y-3">
          <textarea
            className="w-full min-h-28 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
            value={createMessage}
            onChange={(e) => setCreateMessage(e.target.value)}
            placeholder="Message..."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={createPinned} onChange={(e) => setCreatePinned(e.target.checked)} />
              Pinned
            </label>
            <div className="text-sm text-zinc-300">
              <div className="text-xs text-zinc-400">Priority</div>
              <input
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
                type="number"
                value={createPriority}
                onChange={(e) => setCreatePriority(Number(e.target.value || 0))}
              />
            </div>
            <div className="text-sm text-zinc-300">
              <div className="text-xs text-zinc-400">Expires at (optional)</div>
              <input
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
                type="datetime-local"
                value={createExpiresAt}
                onChange={(e) => setCreateExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <button
            className="rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/60"
            onClick={async () => {
              setOk(null);
              setErr(null);
              try {
                const msg = createMessage.trim();
                if (!msg) throw new Error("Message required");
                await apiFetch("/api/owner/announcements", {
                  method: "POST",
                  body: JSON.stringify({
                    message: msg,
                    pinned: createPinned,
                    priority: createPriority,
                    expires_at: parseLocalDatetimeToISO(createExpiresAt),
                  }),
                });
                setOk("Created");
                setCreateMessage("");
                setCreatePinned(false);
                setCreatePriority(0);
                setCreateExpiresAt("");
                await load();
              } catch (e: any) {
                setErr(e?.message || "Failed");
              }
            }}
          >
            Create
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="font-semibold">Manage</div>
        <div className="mt-3 space-y-2 text-sm">
          {loading ? (
            <div className="text-zinc-400">Loading…</div>
          ) : sorted.length === 0 ? (
            <div className="text-zinc-400">No announcements</div>
          ) : (
            sorted.map((a) => <AnnouncementRow key={a.announcement_id} ann={a} onChanged={load} />)
          )}
        </div>
      </div>
    </div>
  );
}

function AnnouncementRow({ ann, onChanged }: { ann: Ann; onChanged: () => Promise<void> }) {
  const [message, setMessage] = useState(ann.message);
  const [pinned, setPinned] = useState(!!ann.pinned);
  const [priority, setPriority] = useState(Number(ann.priority || 0));
  const [expiresAt, setExpiresAt] = useState(toLocalDatetimeInputValue(ann.expires_at || null));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const msg = message.trim();
      if (!msg) throw new Error("Message required");
      await apiFetch(`/api/owner/announcements/${encodeURIComponent(ann.announcement_id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          message: msg,
          pinned,
          priority,
          expires_at: parseLocalDatetimeToISO(expiresAt),
        }),
      });
      await onChanged();
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this announcement?")) return;
    setSaving(true);
    setErr(null);
    try {
      await apiFetch(`/api/owner/announcements/${encodeURIComponent(ann.announcement_id)}`, { method: "DELETE" });
      await onChanged();
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 p-3">
      <textarea
        className="w-full min-h-20 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600 text-sm"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          Pinned
        </label>
        <div className="text-sm text-zinc-300">
          <div className="text-xs text-zinc-400">Priority</div>
          <input
            className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value || 0))}
          />
        </div>
        <div className="text-sm text-zinc-300">
          <div className="text-xs text-zinc-400">Expires at</div>
          <input
            className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
      </div>

      {err && <div className="mt-2 text-xs text-red-200">{err}</div>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/60 disabled:opacity-60"
          disabled={saving}
          onClick={() => void save()}
        >
          Save
        </button>
        <button
          className="rounded-xl border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-200 hover:bg-red-950/50 disabled:opacity-60"
          disabled={saving}
          onClick={() => void remove()}
        >
          Delete
        </button>
        <div className="ml-auto text-xs text-zinc-500 flex items-center gap-2">
          {ann.pinned ? <span>pinned</span> : null}
          <span>priority {Number(ann.priority || 0)}</span>
          <span>{ann.created_at ? new Date(ann.created_at).toLocaleString() : ""}</span>
        </div>
      </div>
    </div>
  );
}

