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

// ---------- Step 5: Required documents ----------
export type RequiredDocsRequest = {
  category: string;              // e.g. "Invoice Factoring"
  country?: 'US' | 'CA';
  amount?: number;
  time_in_business_months?: number;
  monthly_revenue?: number;
  credit_score?: number;
};

export type RequiredDoc = { key: string; label: string; required: boolean; when?: string };
export type ApiOptions = {};

export async function listDocuments(
  body: RequiredDocsRequest,
  opts: ApiOptions = {}
): Promise<{ documents: RequiredDoc[] }> {
  // Preferred staff endpoint
  try {
    const r = await safeFetch('/api/required-docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (r.ok) {
      const j = await r.json();
      const docs = (j.documents ?? j.required ?? j.docs ?? []) as RequiredDoc[];
      return { documents: Array.isArray(docs) ? docs : [] };
    }
  } catch { /* fall through to local map */ }

  // Fallback map (keeps UX working if staff endpoint is unavailable)
  const base: Record<string, RequiredDoc[]> = {
    'Invoice Factoring': [
      { key: 'application', label: 'Completed application', required: true },
      { key: 'ar-aging',   label: 'A/R aging report',       required: true },
      { key: 'bank-3m',    label: 'Last 3 months bank statements', required: true },
    ],
    'Equipment Financing': [
      { key: 'application', label: 'Completed application',   required: true },
      { key: 'quote',       label: 'Equipment quote/invoice', required: true },
      { key: 'bank-3m',     label: 'Last 3 months bank statements', required: true },
    ],
    'Business Line of Credit': [
      { key: 'application', label: 'Completed application', required: true },
      { key: 'bank-3m',     label: 'Last 3 months bank statements', required: true },
      { key: 'tax-return',  label: 'Most recent business tax return', required: false },
    ],
    'Term Loan': [
      { key: 'application', label: 'Completed application', required: true },
      { key: 'financials',  label: 'YTD P&L and Balance Sheet', required: true },
      { key: 'tax-return',  label: 'Most recent business tax return', required: true },
    ],
    'Purchase Order Financing': [
      { key: 'application', label: 'Completed application', required: true },
      { key: 'po',          label: 'Purchase order(s)',     required: true },
      { key: 'supplier',    label: 'Supplier quote',        required: true },
    ],
    'Working Capital': [
      { key: 'application', label: 'Completed application', required: true },
      { key: 'bank-3m',     label: 'Last 3 months bank statements', required: true },
    ],
  };
  const key = body?.category || 'Working Capital';
  return { documents: base[key] ?? base['Working Capital'] };
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