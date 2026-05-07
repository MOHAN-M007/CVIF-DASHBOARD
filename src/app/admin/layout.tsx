"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800/60"
    >
      {label}
    </a>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== "owner") router.replace("/dashboard");
  }, [loading, user, router]);

  if (loading || !user || user.role !== "owner") {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 h-fit sticky top-6">
          <div className="text-xs text-zinc-400">Owner Panel</div>
          <div className="text-lg font-semibold mt-1">CVIF Admin</div>
          <div className="mt-4 space-y-1">
            <NavLink href="/admin" label="Overview" />
            <NavLink href="/admin/users" label="Users" />
            <NavLink href="/admin/announcements" label="Announcements" />
            <NavLink href="/admin/transactions" label="Transactions" />
            <NavLink href="/admin/logs" label="Audit Logs" />
            <NavLink href="/admin/players/live" label="Live Players" />
          </div>
          <div className="mt-6 text-xs text-zinc-500">
            Signed in as <span className="text-zinc-300">{user.username}</span>
          </div>
          <a
            href="/dashboard"
            className="mt-3 inline-block text-xs underline text-zinc-400 hover:text-zinc-200"
          >
            Back to Dashboard
          </a>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

