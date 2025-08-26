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

async function getJson(path:string){
  const r = await fetch(path, { credentials:"include" });
  if(!r.ok) throw new ApiError(r.status, "HTTP_ERROR", await r.text().catch(()=>undefined));
  return r.json();
}

export async function fetchCatalog(){
  const j = await getJson("/api/catalog/export-products?includeInactive=1");
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

// Legacy compatibility
export async function listDocuments(input: any): Promise<RequiredDoc[]> {
  return [FALLBACK_BANK6];
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