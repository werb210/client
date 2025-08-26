export class ApiError extends Error {
  constructor(public status:number, public code:string, public info?:any){
    super(`${status} ${code}`);
    this.name = 'ApiError';
  }
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

export type RequiredDocsInput = {
  productId?: string;
  category?: string;
  country?: "US"|"CA" | string;
  amount?: number;
  lenderId?: string;
};

export type RequiredDoc = {
  key: string;
  label: string;
  required: boolean;
  months?: number;
  reason?: string;
};

const BASELINE_DOC: RequiredDoc = {
  key: "bank_statements",
  label: "Last 6 months bank statements",
  required: true,
  months: 6
};

export async function listDocuments(input: RequiredDocsInput): Promise<RequiredDoc[]> {
  // 1) Try Staff API (public)
  try {
    const r = await fetch("/api/required-docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input ?? {})
    });
    if (r.ok) {
      const j = await r.json();
      let docs: RequiredDoc[] = Array.isArray(j?.documents) ? j.documents : [];
      // guarantee baseline >= 6 months
      const idx = docs.findIndex(d => d.key === "bank_statements");
      if (idx === -1) {
        docs.unshift({ ...BASELINE_DOC });
      } else {
        const d = docs[idx];
        docs[idx] = {
          ...d,
          required: true,
          label: BASELINE_DOC.label,
          months: Math.max(6, Number(d.months ?? 0))
        };
      }
      return docs;
    }
  } catch (_) {/* fall through */}

  // 2) Fallback (local baseline only)
  return [ { ...BASELINE_DOC } ];
}

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
  const r = await safeFetch("/api/lender-products");
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
  const url = category ? `/api/lender-products?category=${encodeURIComponent(category)}` : "/api/lender-products";
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

export type CatalogProduct = {
  id: string;
  name: string;
  country: "US"|"CA"|string;
  category: string;
  minAmount: number;
  maxAmount: number;
  active: boolean;
};

export async function fetchCatalogProducts(opts?: {
  country?: "US"|"CA";
  amount?: number;
  includeInactive?: boolean;
  cacheBust?: boolean;
}): Promise<{ total:number; products: CatalogProduct[] }> {
  const qs = new URLSearchParams();
  if (opts?.country) qs.set("country", opts.country);
  if (opts?.amount) qs.set("amount", String(opts.amount));
  if (opts?.includeInactive) qs.set("includeInactive","1");
  if (opts?.cacheBust) qs.set("_", String(Date.now()));
  const r = await fetch(`/api/catalog/export-products?${qs.toString()}`, { credentials: "include" });
  if (!r.ok) return { total: 0, products: [] };
  const j = await r.json();
  return { total: j.total ?? (j.products?.length||0), products: j.products || [] };
}

export async function fetchMatchingCategories(amount:number, country:"US"|"CA"): Promise<string[]> {
  const r = await fetch(`/api/catalog/categories?amount=${amount}&country=${country}`);
  if (!r.ok) return [];
  const j = await r.json();
  return Array.isArray(j?.categories) ? j.categories : [];
}