export class ApiError extends Error {
  constructor(
    public status:number,
    public code:string,
    public info?:any
  ){
    super(`${status} ${code}`);
    this.name = 'ApiError';
  }
}

async function safeFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const r = await fetch(input, { credentials: 'include', ...init });
  if (!r.ok) {
    let code = `HTTP_${r.status}`;
    let payload: any = null;
    try { payload = await r.json(); if (payload?.error) code = String(payload.error); } catch {}
    throw new ApiError(r.status, code, payload);
  }
  return r;
}

export async function getJson<T>(url: string): Promise<T> {
  const r = await safeFetch(url);
  return r.json() as Promise<T>;
}

export async function postJson<T>(url: string, body: any): Promise<T> {
  const r = await safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body)
  });
  return r.json() as Promise<T>;
}

// Legacy API methods for backward compatibility
const BASE = ""; // same-origin

const ALLOW_PUBLIC_DOCS_IN_DEV =
  import.meta.env.DEV && import.meta.env.VITE_ALLOW_PUBLIC_DOCS_DEV === "1";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const r = await safeFetch(`${BASE}${path}`, init);
  return r;
}

export async function uploadDocument(appId: string, file: File, documentType: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("document_type", documentType);
  const r = await safeFetch(`${BASE}/api/applications/${appId}/documents/upload`, {
    method: "POST", body: fd
  });
  return r.json();
}

export async function listDocuments(appId: string) {
  const path = ALLOW_PUBLIC_DOCS_IN_DEV
    ? `/api/public/applications/${appId}/documents` // **dev only**
    : `/api/applications/${appId}/documents`;        // **prod & default**
  const r = await safeFetch(path);
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

export async function getDocumentViewUrl(docId: string) {
  const r = await safeFetch(`/api/documents/${docId}/view`);
  return r.json();
}

export async function fetchLenderProducts() {
  // For now, use the existing endpoint but transform to match the expected format
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

// Additional API methods needed by queryClient
export async function getUserApplications() {
  const r = await safeFetch("/api/applications");
  return r.json();
}

export async function getApplication(applicationId: string) {
  const r = await safeFetch(`/api/applications/${applicationId}`);
  return r.json();
}

export async function fetchRequiredDocuments(category: string) {
  const r = await safeFetch(`/api/documents/requirements?category=${encodeURIComponent(category)}`);
  return r.json();
}

export async function getLenderProducts(category?: string) {
  const url = category ? `/api/lender-products?category=${encodeURIComponent(category)}` : "/api/lender-products";
  const r = await safeFetch(url);
  return r.json();
}