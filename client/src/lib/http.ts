import axios from 'axios';

export const staffApi = axios.create({
  baseURL: import.meta.env.VITE_STAFF_API || 'https://staff.boreal.financial/api',
  withCredentials: true,
});

// Local-only namespace that the Service Worker will intercept (/_pwa/*)
export const localApi = axios.create({
  baseURL: '/',          // same-origin
  withCredentials: true,
});

// Legacy API function for backward compatibility
export async function api(path: string, init: RequestInit = {}) {
  const url = path.startsWith("/api") ? path : `/api${path}`;
  const res = await fetch(url, { ...init, headers: { Accept: "application/json", ...(init.headers||{}) } });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  if (!ct.includes("application/json")) throw new Error("Non-JSON response");
  return res.json();
}