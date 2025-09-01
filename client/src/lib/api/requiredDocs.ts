// Removed circular import
export type RequiredDoc = {
  key: string; name: string; description?: string|null;
  required: boolean; category?: string|null;
  allowed_mime?: string[]|null; min_count?: number|null; max_count?: number|null; meta?: any;
  source?: "product"|"lender"|"master";
};
const BASE = "/api";
const TOK  = import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || "";
export async function fetchRequiredDocs(opts: { productId?: string; lenderId?: string }): Promise<RequiredDoc[]> {
  const params = new URLSearchParams();
  if (opts.productId) params.set("productId", opts.productId);
  if (opts.lenderId)  params.set("lenderId",  opts.lenderId);
  const url = `${BASE}/required-docs?${params.toString()}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${TOK}` }, cache:"no-store" });
  if (!r.ok) { throw new Error(`required-docs fetch failed: ${r.status}`); }
  const docs = await r.json();
  return Array.isArray(docs) ? docs : [];
}