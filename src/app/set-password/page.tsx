"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function SetPasswordPage() {
  const [username, setUsername] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h1 className="text-xl font-semibold">Create Website Password</h1>
        <p className="mt-1 text-sm text-zinc-400">
          This password is for the dashboard only. Minecraft AuthCore is unchanged.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setOk(null);
            setErr(null);

            const u = username.trim();
            if (!u) return setErr("username is required");
            if (!pw1 || pw1.length < 6) return setErr("password too short");
            if (pw1 !== pw2) return setErr("passwords do not match");

            setSubmitting(true);
            try {
              await apiFetch<{ success: true }>("/api/auth/set-web-password", {
                method: "POST",
                body: JSON.stringify({ username: u, newPassword: pw1 }),
              });
              setOk("Website password created successfully");
              setPw1("");
              setPw2("");
            } catch (e: any) {
              setErr(e?.message || "Failed to set password");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div>
            <label className="block text-sm text-zinc-300">Username</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300">New password</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
              type="password"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300">Confirm password</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {ok && (
            <div className="rounded-xl border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-100">
              {ok}
            </div>
          )}
          {err && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-zinc-100 text-zinc-950 py-2 font-medium hover:bg-white disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save password"}
          </button>

          <div className="text-xs text-zinc-400">
            <a className="underline hover:text-zinc-200" href="/login">
              Back to login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

