"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

export type MeUser = {
  user_id: string;
  username: string;
  role: "player" | "officer" | "admin" | "owner";
};

type UseAuthOptions = {
  autoRefresh?: boolean;
};

export function useAuth(options: UseAuthOptions = {}) {
  const { autoRefresh = true } = options;
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ success: true; user: MeUser }>("/api/auth/me", { method: "GET" });
      setUser(res.user);
    } catch (e: any) {
      setUser(null);
      setError(e?.message || "Unauthorized");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    await apiFetch<{ success: true; user: MeUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password, ip: "web" }),
    });
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await apiFetch<{ success: true }>("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh) {
      setLoading(false);
      return;
    }
    void refresh();
  }, [refresh, autoRefresh]);

  return useMemo(
    () => ({ user, loading, error, refresh, login, logout }),
    [user, loading, error, refresh, login, logout]
  );
}
