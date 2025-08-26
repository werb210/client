export async function api(path: string, init: RequestInit = {}) {
  const url = path.startsWith("/api") ? path : `/api${path}`;
  const res = await fetch(url, { ...init, headers: { Accept: "application/json", ...(init.headers||{}) } });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  if (!ct.includes("application/json")) throw new Error("Non-JSON response");
  return res.json();
}