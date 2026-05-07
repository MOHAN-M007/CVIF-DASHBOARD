"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

export default function ShopPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = String(params.shopId || "");
  const { user, loading } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !shopId) return;
    (async () => {
      setErr(null);
      try {
        const [s, a, h] = await Promise.all([
          apiFetch<any>(`/api/market/shops/${encodeURIComponent(shopId)}`, { method: "GET" }),
          apiFetch<any>(`/api/market/shops/${encodeURIComponent(shopId)}/analytics`, { method: "GET" }),
          apiFetch<any>(`/api/market/shops/${encodeURIComponent(shopId)}/history?limit=20&page=1`, { method: "GET" }),
        ]);
        setShop(s.shop || s.data || s);
        setAnalytics(a.data || a);
        setHistory(h.data || []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load shop");
      }
    })();
  }, [user, shopId]);

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
            <div className="text-sm text-zinc-400">Shop</div>
            <div className="text-lg font-semibold">{shop?.shop_name || shopId}</div>
          </div>
          <button className="rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900" onClick={() => router.push("/dashboard")}>
            Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {err && (
          <div className="rounded-2xl border border-red-900 bg-red-950/40 px-4 py-3 text-red-200">{err}</div>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-semibold">Analytics</div>
          <pre className="mt-3 text-xs text-zinc-300 overflow-auto">{JSON.stringify(analytics, null, 2)}</pre>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="font-semibold">History</div>
          <div className="mt-3 space-y-2 text-sm">
            {history.length === 0 ? (
              <div className="text-zinc-400">No history</div>
            ) : (
              history.map((t: any, idx: number) => (
                <div key={idx} className="rounded-xl border border-zinc-800 px-3 py-2 flex items-center justify-between">
                  <div className="text-zinc-100">{t.type} {t.amount}</div>
                  <div className="text-xs text-zinc-400">{t.timestamp ? new Date(t.timestamp).toLocaleString() : ""}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
