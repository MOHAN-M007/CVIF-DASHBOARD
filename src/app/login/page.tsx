"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!loading && user) {
    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h1 className="text-xl font-semibold">CVIF Dashboard Login</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Use your CVIF website password (set it once, then login here).
        </p>
        <p className="mt-2 text-xs text-zinc-400">
          First time?{" "}
          <a className="underline hover:text-zinc-200" href="/set-password">
            Create website password
          </a>
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLocalError(null);
            setSubmitting(true);
            try {
              await login(username.trim(), password);
              router.replace("/dashboard");
            } catch (err: any) {
              setLocalError(err?.message || "Login failed");
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
            <label className="block text-sm text-zinc-300">Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              minLength={6}
            />
          </div>

          {(localError || error) && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {localError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-zinc-100 text-zinc-950 py-2 font-medium hover:bg-white disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
