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

// --- Types ---
export type RequiredDocsInput = {
  category?: string;
  country?: string;
  amount?: number;
  lenderId?: string;
  timeInBusinessMonths?: number;
  monthlyRevenue?: number;
  creditScore?: number;
};

export type RequiredDoc =
  | { key: string; label: string; required: boolean; reason?: string }
  | string;

// --- Fallbacks by category (used if server isn't ready) ---
const DOCS_FALLBACK: Record<string, RequiredDoc[]> = {
  "Working Capital": [
    { key: "bank_3m", label: "Last 3 months bank statements", required: true },
    { key: "void_cheque", label: "Void cheque", required: true },
    { key: "gov_id", label: "Government-issued ID", required: true },
  ],
  "Business Line of Credit": [
    { key: "bank_6m", label: "Last 6 months bank statements", required: true },
    { key: "yr_fin", label: "Most recent year financials or NOA", required: false },
  ],
  "Term Loan": [
    { key: "tax_returns", label: "Most recent business tax return", required: true },
    { key: "fin_statements", label: "YTD financial statements", required: true },
  ],
  "Equipment Financing": [
    { key: "equipment_quote", label: "Equipment quote/invoice", required: true },
    { key: "bank_3m", label: "Last 3 months bank statements", required: true },
  ],
  "Invoice Factoring": [
    { key: "ar_aging", label: "A/R aging report", required: true },
    { key: "sample_invoices", label: "Sample customer invoices", required: true },
  ],
  "Purchase Order Financing": [
    { key: "purchase_orders", label: "Approved purchase orders", required: true },
    { key: "supplier_quote", label: "Supplier quote", required: true },
  ],
};

// --- Exported API used by Step 5 ---
export async function listDocuments(input: RequiredDocsInput): Promise<RequiredDoc[]> {
  try {
    const r = await fetch("/api/required-docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
    if (r.ok) {
      const j = await r.json();
      const docs = j?.documents ?? j?.requiredDocs ?? j?.data ?? [];
      if (Array.isArray(docs) && docs.length) return docs as RequiredDoc[];
    }
  } catch {
    // fall through to fallback
  }
  const cat = input.category ?? "Working Capital";
  return DOCS_FALLBACK[cat] ?? [];
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