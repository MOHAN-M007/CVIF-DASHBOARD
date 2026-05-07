"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

type BankBalanceRes = {
  success: true;
  wallet_balance: number;
  bank_balance: number;
  loan_status: any;
};

type ShopMineRes = { success: true; shops: any[] } | { success: true; data: any[] };

type AnnouncementRes = { success: true; data: any[] };

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [bank, setBank] = useState<BankBalanceRes | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [ann, setAnn] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      setDataLoading(true);
      setErr(null);
      try {
        const [bankRes, shopRes, annRes] = await Promise.all([
          apiFetch<BankBalanceRes>("/api/bank/balance", { method: "GET" }),
          apiFetch<any>("/api/market/shops/mine", { method: "GET" }),
          apiFetch<AnnouncementRes>("/api/announcements", { method: "GET" }),
        ]);

        const shopList = Array.isArray(shopRes?.shops)
          ? shopRes.shops
          : Array.isArray(shopRes?.data)
            ? shopRes.data
            : [];

        if (!alive) return;
        setBank(bankRes);
        setShops(shopList);
        setAnn(Array.isArray(annRes.data) ? annRes.data : []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load dashboard");
      } finally {
        if (alive) setDataLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const loanText = useMemo(() => {
    if (!bank?.loan_status) return "No data";
    if (!bank.loan_status.active) return "No active loan";
    return `${bank.loan_status.status} • ${bank.loan_status.amount}`;
  }, [bank]);

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
            <div className="text-sm text-zinc-400">CVIF Dashboard</div>
            <div className="text-lg font-semibold">{user.username}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs rounded-full border border-zinc-800 px-2 py-1 text-zinc-300">
              role: {user.role}
            </span>
            <button
              className="rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {err && (
          <div className="rounded-2xl border border-red-900 bg-red-950/40 px-4 py-3 text-red-200">
            {err}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="text-sm text-zinc-400">Wallet</div>
            <div className="mt-1 text-2xl font-semibold">
              {dataLoading ? "…" : bank ? bank.wallet_balance : "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="text-sm text-zinc-400">Bank</div>
            <div className="mt-1 text-2xl font-semibold">
              {dataLoading ? "…" : bank ? bank.bank_balance : "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="text-sm text-zinc-400">Loan</div>
            <div className="mt-1 text-sm text-zinc-200">
              {dataLoading ? "…" : loanText}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="font-semibold">Announcements</div>
            <div className="mt-3 space-y-2 text-sm text-zinc-200">
              {dataLoading ? (
                <div className="text-zinc-400">Loading…</div>
              ) : ann.length === 0 ? (
                <div className="text-zinc-400">No announcements</div>
              ) : (
                ann.slice(0, 5).map((a: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-zinc-800 px-3 py-2">
                    {a.message || JSON.stringify(a)}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="font-semibold">My Shops</div>
            <div className="mt-3 space-y-2 text-sm">
              {dataLoading ? (
                <div className="text-zinc-400">Loading…</div>
              ) : shops.length === 0 ? (
                <div className="text-zinc-400">No shops yet</div>
              ) : (
                shops.slice(0, 8).map((s: any) => (
                  <div key={String(s.shop_id || s._id)} className="rounded-xl border border-zinc-800 px-3 py-2 flex items-center justify-between">
                    <div>
                      <div className="text-zinc-100">{s.shop_name || s.shop_id || "Shop"}</div>
                      <div className="text-xs text-zinc-400">plot: {s.plot_id || "—"}</div>
                    </div>
                    <button
                      className="text-xs rounded-lg border border-zinc-700 px-2 py-1 hover:bg-zinc-800"
                      onClick={() => router.push(`/shops/${encodeURIComponent(String(s.shop_id || s._id))}`)}
                    >
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {user.role === "owner" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="font-semibold">Admin</div>
            <div className="mt-2 text-sm text-zinc-300">
              <button
                className="rounded-xl border border-zinc-800 px-3 py-2 hover:bg-zinc-900"
                onClick={() => router.push("/admin")}
              >
                Open Admin Panel
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
