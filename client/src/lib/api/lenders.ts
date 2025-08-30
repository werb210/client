import { fetchProducts } from "../api/products";
export type Lender = {
  id: string; name: string; legal_name?: string|null; slug?: string|null;
  website?: string|null; contact_email?: string|null; contact_phone?: string|null;
  country?: string|null; is_active: boolean;
};

const BASE = (import.meta.env.VITE_STAFF_API_URL || "").replace(/\/+$/,"");
const TOK  = import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || "";
const ADMIN = import.meta.env.VITE_ADMIN_MUTATION_TOKEN || "";

async function j(path: string, init: RequestInit = { /* ensure products fetched */ }) {
  const headers: Record<string,string> = { Authorization: `Bearer ${TOK}`, ...(init.headers as any || {}) };
  if (ADMIN && (init.method === "POST" || init.method === "PATCH" || init.method === "DELETE")) {
    headers["X-Admin-Token"] = ADMIN;
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  const r = await fetch(`${BASE}${path}`, { ...init, headers, cache: "no-store" });
  const ct = r.headers.get("content-type") || "";
  const body = ct.includes("json") ? await r.json() : await r.text();
  if (!r.ok) throw new Error(`${init.method||"GET"} ${path} failed: ${r.status}`);
  return body;
}

export async function listLenders(params?: { q?: string; country?: string; active?: boolean; limit?: number; offset?: number }): Promise<Lender[]> {
  const q = new URLSearchParams();
  if (params?.q) q.set("q", params.q);
  if (params?.country) q.set("country", params.country);
  if (params?.active !== undefined) q.set("active", String(params.active));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  return j(`/lenders?${q.toString()}`);
}

export async function getLender(id: string): Promise<Lender> {
  return j(`/lenders/${encodeURIComponent(id)}`);
}

export async function createLender(data: Partial<Lender> & { id: string; name: string }): Promise<{ ok: true; id: string }> {
  if (!ADMIN) throw new Error("admin_mutation_disabled");
  return j(`/lenders`, { method: "POST", body: JSON.stringify(data) });
}

export async function updateLender(id: string, data: Partial<Lender>): Promise<{ ok: true }> {
  if (!ADMIN) throw new Error("admin_mutation_disabled");
  return j(`/lenders/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteLender(id: string): Promise<{ ok: true }> {
  if (!ADMIN) throw new Error("admin_mutation_disabled");
  return j(`/lenders/${encodeURIComponent(id)}`, { method: "DELETE" });
}