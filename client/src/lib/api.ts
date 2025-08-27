const BASE = import.meta.env.VITE_STAFF_BASE ?? "/";
const j = async (p: string, init?: RequestInit) => {
  const r = await fetch(BASE.replace(/\/$/,"") + p, {credentials:"include", ...init});
  if (!r.ok) throw new Error(`api ${p} -> ${r.status}`);
  return r.json();
};

export class ApiError extends Error {
  constructor(public status:number, public code:string, public info?:any){ super(code); }
}
async function safeFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const r = await fetch(input, { credentials: 'include', ...init });
  if (!r.ok) {
    let code = `HTTP_${r.status}`; let info: any = null;
    try { info = await r.json(); if (info?.error) code = String(info.error); } catch {}
    throw new ApiError(r.status, code, info);
  }
  return r;
}
export async function getJson<T>(url: string): Promise<T> {
  const r = await safeFetch(url); return r.json() as Promise<T>;
}
export async function postJson<T>(url: string, body: any): Promise<T> {
  const r = await safeFetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  return r.json() as Promise<T>;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return safeFetch(path, init);
}

export type LenderProduct = {
  id: string;
  name: string;
  lender_name: string;
  country: "US"|"CA";
  category: string;
  min_amount: number;
  max_amount: number;
  active: boolean;
  documents?: Array<{ key:string; label:string; required:boolean; months?:number }>;
};

export type RequiredDoc = { key:string; label:string; required:boolean; months?:number } | string;

// Removed duplicate getJson function

export async function fetchCatalog(){
  const j = await getJson<any>("/api/catalog/export-products?includeInactive=1");
  const src = Array.isArray(j) ? j : (j.products ?? []);
  const products: LenderProduct[] = (src as any[]).map(p => ({
    id: String(p.id),
    name: String(p.name ?? p.product_name ?? p.productName ?? "Unnamed"),
    lender_name: String(p.lender_name ?? p.lenderName ?? ""),
    country: String(p.country ?? p.countryOffered ?? "").toUpperCase() as "US"|"CA",
    category: String(p.category ?? p.productCategory ?? ""),
    min_amount: Number(p.min_amount ?? p.minimumLendingAmount ?? 0) || 0,
    max_amount: Number(p.max_amount ?? p.maximumLendingAmount ?? 0) || 0,
    active: Boolean(p.active ?? p.isActive ?? true),
    documents: Array.isArray(p.documents ?? p.required_documents) ? (p.documents ?? p.required_documents) : undefined,
  }));

  // Guard uniform/stub dataset
  const uniq = (a:any[]) => Array.from(new Set(a));
  const looksUniform = products.length>0
    && (uniq(products.map(p=>p.country)).length===1 || uniq(products.map(p=>p.category)).length===1)
    && uniq(products.map(p=>String(p.min_amount))).length===1
    && uniq(products.map(p=>String(p.max_amount))).length===1;
  if(looksUniform) throw new ApiError(412,"ASK_REFRESH_DATASET",{ hint:"/api/catalog/sanity" });

  return { total: products.length, products };
}

export function categoriesFor(amount:number, country:"US"|"CA", products:LenderProduct[]){
  const out = new Set<string>();
  for(const p of products){
    if(p.country!==country) continue;
    if(amount < p.min_amount) continue;
    if(p.max_amount && amount > p.max_amount) continue;
    if(p.category) out.add(p.category);
  }
  return Array.from(out).sort();
}

const FALLBACK_BANK6: RequiredDoc = { key:"bank_statements", label:"Last 6 months bank statements", required:true, months:6 };

export async function listDocumentsFor(product: LenderProduct){
  if(product.documents?.length) return product.documents;
  try{
    const r = await fetch("/api/required-docs", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ category: product.category, country: product.country, amount: product.min_amount })
    });
    if(r.ok){
      const j = await r.json();
      const docs = j?.documents ?? j?.requiredDocs ?? [];
      if(Array.isArray(docs) && docs.length) return docs;
    }
  }catch{}
  return [FALLBACK_BANK6];
}

// Legacy compatibility removed - using new comprehensive listDocuments function

// ---------- Document Management ----------
export async function getDocumentViewUrl(docId: string) {
  const r = await safeFetch(`/api/documents/${docId}/view`);
  return r.json();
}

export async function setDocumentStatus(docId: string, status: "accepted"|"rejected"|"pending") {
  const r = await safeFetch(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return r.json();
}

export async function uploadDocument(appId: string, file: File, documentType: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("document_type", documentType);
  const r = await safeFetch(`/api/applications/${appId}/documents/upload`, {
    method: "POST", body: fd
  });
  return r.json();
}

// ---------- Product Data ----------
export async function fetchLenderProducts() {
  const r = await safeFetch("/api/catalog/export-products?includeInactive=1");
  const response = await r.json();
  
  // Extract products array from response and transform to match LenderProduct shape
  if (response.success && response.products) {
    const transformedProducts = response.products.map((p: any) => ({
      id: p.id,
      name: p.productName || p.name,
      lender_id: p.lender_id || 'unknown',
      lender_name: p.lenderName || p.lender_name,
      tenant_id: p.tenant_id || 'default',
      country: (p.countryOffered || p.country) as 'US' | 'CA',
      category: p.productCategory || p.category,
      min_amount: p.minimumLendingAmount ?? p.min_amount ?? null,
      max_amount: p.maximumLendingAmount ?? p.max_amount ?? null,
      active: p.isActive ?? p.active ?? true,
      variant_sig: p.variant_sig
    }));
    
    return transformedProducts;
  } else {
    return [];
  }
}

export async function getLenderProducts(category?: string) {
  const url = category ? `/api/catalog/export-products?includeInactive=1?category=${encodeURIComponent(category)}` : "/api/catalog/export-products?includeInactive=1";
  const r = await safeFetch(url);
  return r.json();
}

export type LenderProductRow = {
  id?: string;
  name?: string;
  product_name?: string;
  lender_name?: string;
  lenderName?: string;
  country?: string;
  min_amount?: number;
  minimumLendingAmount?: number;
  max_amount?: number;
  maximumLendingAmount?: number;
  category?: string;
  productCategory?: string;
};

export async function fetchLenderProductsLive(params?: {
  country?: "US" | "CA";
  amount?: number;
  includeInactive?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.country) qs.set("country", params.country);
  if (params?.amount) qs.set("amount", String(params.amount));
  if (params?.includeInactive) qs.set("includeInactive", "1");
  const r = await fetch(`/api/catalog/export-products?${qs.toString()}`, { credentials: "include" });
  if (!r.ok) throw new Error(`export-products ${r.status}`);
  const j = await r.json();
  const rows: LenderProductRow[] = Array.isArray(j.products) ? j.products : [];
  const total = j.total ?? rows.length ?? 0;
  return { total, products: rows };
}

export async function getMatchingCategories(amount: number, country: "US" | "CA") {
  const r = await fetch(`/api/catalog/categories?amount=${amount}&country=${country}`);
  if (!r.ok) return [];
  const j = await r.json();
  return Array.isArray(j?.categories) ? j.categories as string[] : [];
}

// Removed duplicate CatalogProduct type and fetchCatalogProducts function - using the ones at end of file

export async function fetchMatchingCategories(amount:number, country:"US"|"CA"): Promise<string[]> {
  const r = await fetch(`/api/catalog/categories?amount=${amount}&country=${country}`);
  if (!r.ok) return [];
  const j = await r.json();
  return Array.isArray(j?.categories) ? j.categories : [];
}

// ========== CATALOG FIELDS DEBUG FUNCTIONALITY ==========

// Removed duplicate CanonicalField definition

export type CatalogFieldsResponse = {
  canonical_fields: CanonicalField[];
  legacy_aliases: Record<string,string>;
  sample_endpoint: string;
  export_endpoint: string;
};

export async function getCatalogFields(): Promise<CatalogFieldsResponse> {
  const r = await fetch("/api/catalog/fields", { credentials: "include" });
  if (!r.ok) throw new Error("fields fetch failed: " + r.status);
  return r.json();
}

export async function getCatalogSample(): Promise<any> {
  const r = await fetch("/api/catalog/sample", { credentials: "include" });
  if (!r.ok) throw new Error("sample fetch failed: " + r.status);
  return r.json();
}

/** Canonical, normalized product shape the CLIENT should use everywhere. */
export type LenderProductNormalized = {
  id: string;
  name: string;
  lender_id?: string|null;
  lender_name?: string|null;
  country: "US"|"CA";
  category: "Business Line of Credit"|"Term Loan"|"Equipment Financing"|"Invoice Factoring"|"Purchase Order Financing"|"Working Capital";
  min_amount?: number|null;
  max_amount?: number|null;
  interest_rate_min?: number|null;
  interest_rate_max?: number|null;
  term_min?: number|null;  // months
  term_max?: number|null;  // months
  active: boolean;
  required_documents?: Array<{ key: string; label: string; required: boolean; reason?: string }|string>;
};

// Legacy → canonical normalization used by list/export calls.
export function normalizeProduct(p: any): LenderProductNormalized {
  const name         = p?.name ?? p?.productName;
  const lender_name  = p?.lender_name ?? p?.lenderName ?? null;
  const country      = (p?.country ?? p?.countryOffered ?? "").toString().toUpperCase();
  const category     = p?.category ?? p?.productCategory;
  const min_amount   = p?.min_amount ?? p?.minimumLendingAmount ?? null;
  const max_amount   = p?.max_amount ?? p?.maximumLendingAmount ?? null;
  const active       = (typeof p?.active === "boolean") ? p.active : !!p?.isActive;

  // Universal doc minimum (server may also provide)
  const docs = Array.isArray(p?.required_documents) && p.required_documents.length
    ? p.required_documents
    : [{ key: "bank_6m", label: "Last 6 months bank statements", required: true }];

  return {
    id: String(p?.id ?? ""),
    name: String(name ?? ""),
    lender_id: p?.lender_id ?? null,
    lender_name: lender_name ? String(lender_name) : null,
    country: (country === "CA" ? "CA" : "US") as "US"|"CA",
    category: String(category ?? "Working Capital") as LenderProductNormalized["category"],
    min_amount: (min_amount == null ? null : Number(min_amount)),
    max_amount: (max_amount == null ? null : Number(max_amount)),
    interest_rate_min: (p?.interest_rate_min == null ? null : Number(p.interest_rate_min)),
    interest_rate_max: (p?.interest_rate_max == null ? null : Number(p.interest_rate_max)),
    term_min: (p?.term_min == null ? null : Number(p.term_min)),
    term_max: (p?.term_max == null ? null : Number(p.term_max)),
    active,
    required_documents: docs
  };
}

export async function fetchCatalogNormalized(limit = 25): Promise<{ total:number; products:LenderProductNormalized[] }> {
  const r = await fetch(`/api/catalog/export-products?includeInactive=1&limit=${limit}`, { credentials: "include" });
  if (!r.ok) throw new Error("export-products failed: " + r.status);
  const j = await r.json();
  const products = Array.isArray(j?.products) ? j.products.map(normalizeProduct) : [];
  const total = Number(j?.total ?? products.length);
  return { total, products };
}

export type CatalogDump = {
  total: number;
  canonical_fields: string[];
  products: Record<string, any>[];
};

export type CanonicalField = {
  name: string;
  type: string;
  required?: boolean;
};

// Removed duplicate RequiredDoc definition

export type CanonicalProduct = {
  id: string;
  name: string;
  lender_id?: string | null;
  lender_name: string;
  country: "CA" | "US";
  category: string;
  min_amount: number;
  max_amount: number;
  interest_rate_min?: number | null;
  interest_rate_max?: number | null;
  term_min?: number | null;
  term_max?: number | null;
  active: boolean;
  required_documents?: RequiredDoc[];
};

type DumpResponse = {
  canonical_fields: CanonicalField[];
  products: CanonicalProduct[];
};

const JSON_HEADERS = { "Content-Type": "application/json" as const };

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { credentials: "include", ...init });
  if (!r.ok) throw new Error(`fetch ${url} failed: ${r.status}`);
  return r.json() as Promise<T>;
}

/** Normalize one legacy /api/lender-products row to the canonical shape */
function normalizeLegacy(p: any): CanonicalProduct {
  return {
    id: String(p.id),
    name: p.name ?? p.productName ?? "",
    lender_id: p.lender_id ?? null,
    lender_name: p.lender_name ?? p.lenderName ?? "",
    country: String(p.country ?? p.countryOffered ?? "US").toUpperCase() as "CA" | "US",
    category: p.category ?? p.productCategory ?? "", // used ONLY on legacy fallback
    min_amount: Number(p.min_amount ?? p.minimumLendingAmount ?? 0) || 0,
    max_amount: Number(p.max_amount ?? p.maximumLendingAmount ?? 0) || 0,
    interest_rate_min: p.interest_rate_min ?? p.interestRateMinimum ?? null,
    interest_rate_max: p.interest_rate_max ?? p.interestRateMaximum ?? null,
    term_min: p.term_min ?? p.termMinimum ?? null,
    term_max: p.term_max ?? p.termMaximum ?? null,
    active: Boolean(p.active ?? p.isActive ?? true),
    required_documents:
      p.required_documents ??
      p.documentsRequired ??
      [{ key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 }],
  };
}

/**
 * Fetch canonical fields + products in one go.
 * Order of preference:
 *   1) /api/catalog/dump  (authoritative list of canonical_fields + products)
 *   2) /api/lender-products (legacy; normalized via normalizeLegacy)
 */
export async function fetchCatalogDump(limit = 500): Promise<DumpResponse> {
  try {
    const dump = await fetchJSON<DumpResponse>(`/api/catalog/dump?limit=${limit}`);
    // Trust server-provided canonical fields & product.category (fixes WC-only bug)
    return dump;
  } catch {
    // Legacy fallback: synthesize canonical_fields and normalize products
    const legacy = await fetchJSON<{ products: any[] }>(`/api/lender-products`);
    const products = (legacy.products ?? []).map(normalizeLegacy);
    // Build a minimal canonical_fields list from our CanonicalProduct keys
    const sample = products[0] ?? ({} as CanonicalProduct);
    const canonical_fields: CanonicalField[] = Object.keys(sample).map((k) => ({
      name: k,
      type: typeof (sample as any)[k] === "number" ? "number" : "string",
      required: false,
    }));
    return { canonical_fields, products };
  }
}

export type IntakeInput = {
  amount: number;
  country: "CA" | "US";
  timeInBusinessMonths?: number;
  monthlyRevenue?: number;
  creditScore?: number;
  category?: string; // optional pre-selected category
};

export type CategoryRecommendation = {
  category: string;
  products: CanonicalProduct[];
};

const DOCS_FALLBACK: Record<string, RequiredDoc[]> = {
  "Working Capital": [{ key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 }],
  "Business Line of Credit": [{ key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 }],
  "Term Loan": [{ key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 }],
  "Equipment Financing": [{ key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 }],
  "Invoice Factoring": [{ key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 }],
  "Purchase Order Financing": [{ key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 }],
};

export async function recommendProducts(input: IntakeInput): Promise<CategoryRecommendation[]> {
  const { products } = await fetchCatalogDump(500); // trusts canonical category when available
  const amt = Number(input.amount || 0);
  const cc = String(input.country || "").toUpperCase();

  // 1) Filter by country + amount window
  const matches = products.filter(p =>
    p.country === cc &&
    (Number.isFinite(p.min_amount) ? p.min_amount <= amt : true) &&
    (Number.isFinite(p.max_amount) ? amt <= p.max_amount : true) &&
    p.active !== false
  );

  // 2) Simple relevance scoring (closest max_amount first; then higher max)
  const scored = matches
    .map(p => ({
      score: Math.abs((p.max_amount ?? Number.MAX_SAFE_INTEGER) - amt),
      p,
    }))
    .sort((a, b) => a.score - b.score || (b.p.max_amount ?? 0) - (a.p.max_amount ?? 0))
    .map(x => x.p);

  // 3) Group by canonical category
  const byCat = new Map<string, CanonicalProduct[]>();
  for (const p of scored) {
    const cat = p.category || "Working Capital";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(p);
  }

  // 4) If caller specified a category, surface it first
  const result: CategoryRecommendation[] = [];
  const order = Array.from(byCat.keys());
  if (input.category && byCat.has(input.category)) {
    result.push({ category: input.category, products: byCat.get(input.category)! });
  }
  for (const c of order) {
    if (!input.category || c !== input.category) {
      result.push({ category: c, products: byCat.get(c)! });
    }
  }
  return result;
}

export type RequiredDocsInput = {
  category?: string;
  country?: "CA" | "US";
  amount?: number;
  lenderId?: string;
  timeInBusinessMonths?: number;
  monthlyRevenue?: number;
  creditScore?: number;
};

export async function listDocuments(input: RequiredDocsInput): Promise<RequiredDoc[]> {
  // Prefer Staff endpoint; fall back to baseline (6-month bank statements) per category.
  try {
    const r = await fetch("/api/required-docs", {
      method: "POST",
      headers: JSON_HEADERS,
      credentials: "include",
      body: JSON.stringify(input),
    });
    if (r.ok) {
      const j = await r.json();
      const docs = j?.documents ?? j?.requiredDocs ?? j?.data ?? [];
      if (Array.isArray(docs) && docs.length) {
        return docs.map((d: any, i: number) =>
          typeof d === "string" ? { key: `doc_${i}`, label: d, required: true } : d
        );
      }
    }
  } catch { /* noop → fallback */ }

  const cat = input.category || "Working Capital";
  return DOCS_FALLBACK[cat] ?? DOCS_FALLBACK["Working Capital"];
}

// ========== CATALOG PRODUCTS & LENDERS API ==========

export type CatalogProduct = {
  id: string;
  name: string;
  lender_name: string;
  lender_id?: string;
  country: string;        // "US" | "CA"
  category: string;
  min_amount: number;
  max_amount: number;
  active: boolean;
};

export async function fetchCatalogProducts(): Promise<CatalogProduct[]> {
  // Prefer canonical; fallback to lender-products; never call bare /v1/*
  try {
    const r = await fetch("/api/catalog/export-products?includeInactive=1", { credentials: "include" });
    if (r.ok) {
      const j = await r.json();
      return (j.products ?? []).map((p: any) => ({
        id: p.id,
        name: p.name ?? p.productName,
        lender_name: p.lender_name ?? p.lenderName,
        lender_id: p.lender_id ?? p.lenderId,
        country: String(p.country ?? p.countryOffered ?? "").toUpperCase(),
        category: p.category ?? p.productCategory ?? "Working Capital",
        min_amount: Number(p.min_amount ?? p.minimumLendingAmount ?? 0),
        max_amount: Number(p.max_amount ?? p.maximumLendingAmount ?? Number.MAX_SAFE_INTEGER),
        active: (p.active ?? p.isActive) !== false,
      }));
    }
  } catch {}
  // fallback: legacy lender-products (object with products array)
  const r2 = await fetch("/api/lender-products", { credentials: "include" });
  const legacy = await r2.json();
  const arr = legacy.products ?? [];
  return (arr ?? []).map((p: any) => ({
    id: p.id,
    name: p.productName ?? p.name,
    lender_name: p.lenderName ?? p.lender_name,
    country: String(p.countryOffered ?? p.country ?? "").toUpperCase(),
    category: p.productCategory ?? p.category ?? "Working Capital",
    min_amount: Number(p.minimumLendingAmount ?? p.min_amount ?? 0),
    max_amount: Number(p.maximumLendingAmount ?? p.max_amount ?? Number.MAX_SAFE_INTEGER),
    active: (p.isActive ?? p.active) !== false,
  }));
}

export type UILender = { id: string; name: string; product_count: number };

export async function fetchUILenders(): Promise<UILender[]> {
  // Prefer staff's parity endpoint (already aggregated). If missing, aggregate locally.
  try {
    const r = await fetch("/api/public/lenders", { credentials: "include" });
    if (r.ok) {
      const j = await r.json();
      if (Array.isArray(j?.lenders)) return j.lenders;
      // Handle case where public/lenders returns products array directly
      if (Array.isArray(j)) {
        const by = new Map<string, UILender>();
        for (const p of j) {
          const id = p.lender_id || p.lenderName || p.lender_name;
          const name = p.lenderName || p.lender_name || id;
          const cur = by.get(id) ?? { id, name, product_count: 0 };
          cur.product_count += 1;
          by.set(id, cur);
        }
        return Array.from(by.values()).sort((a,b)=>b.product_count-a.product_count);
      }
    }
  } catch {}
  const prods = await fetchCatalogProducts();
  const by = new Map<string, UILender>();
  for (const p of prods) {
    const id = p.lender_id || p.lender_name;
    const cur = by.get(id) ?? { id, name: p.lender_name, product_count: 0 };
    cur.product_count += 1;
    by.set(id, cur);
  }
  return Array.from(by.values()).sort((a,b)=>b.product_count-a.product_count);
}