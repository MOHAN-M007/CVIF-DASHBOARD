const DEFAULT_BACKEND = "https://cvif-backend.onrender.com";

export const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND).replace(/\/+$/, "");

export type ApiError = { success: false; message: string };

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const msg = data && data.message ? String(data.message) : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
