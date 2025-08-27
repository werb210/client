import { withDiagUrl, wantDiag, mergeClientProv, summarizeProv, downloadJSON } from "./diag";

export type CanonicalProduct = {
  id: string;
  name: string;
  lender_name?: string|null;
  country: "CA"|"US"|null;
  category: string|null;
  min_amount: number|null;
  max_amount: number|null;
  active: boolean;
  required_documents: string[];
  min_time_in_business: number|null;
  min_monthly_revenue: number|null;
};

const up = (s:any)=> (s??"").toString().trim().toUpperCase();

function fromV1(p:any): CanonicalProduct {
  const cc = up(p.countryOffered);
  return {
    id: p.id,
    name: p.productName ?? "",
    lender_name: p.lenderName ?? null,
    country: (cc === "CA" || cc === "US") ? (cc as any) : null,
    category: p.productCategory ?? null,
    min_amount: p.minimumLendingAmount ?? null,
    max_amount: p.maximumLendingAmount ?? null,
    active: (p.isActive ?? true) === true,
    required_documents: Array.isArray(p.required_documents) ? p.required_documents : [],
    min_time_in_business: p.min_time_in_business ?? null,
    min_monthly_revenue: p.min_monthly_revenue ?? null,
  };
}

function fromLegacy(p:any): CanonicalProduct {
  const cc = up(p.country ?? p.countryOffered);
  return {
    id: p.id,
    name: p.name ?? p.productName ?? "",
    lender_name: p.lender_name ?? p.lenderName ?? null,
    country: (cc === "CA" || cc === "US") ? (cc as any) : null,
    category: p.category ?? p.productCategory ?? null,
    min_amount: p.min_amount ?? p.minimumLendingAmount ?? null,
    max_amount: p.max_amount ?? p.maximumLendingAmount ?? null,
    active: (p.active ?? p.isActive ?? true) === true,
    required_documents: Array.isArray(p.required_documents) ? p.required_documents : [],
    min_time_in_business: p.min_time_in_business ?? null,
    min_monthly_revenue: p.min_monthly_revenue ?? null,
  };
}

export async function fetchProducts(): Promise<CanonicalProduct[]> {
  // v1 first
  try {
    const r = await fetch(withDiagUrl("/api/v1/products"), { credentials: "include" });
    if (r.ok) {
      const j = await r.json();
      if (Array.isArray(j)) return j.map(fromV1);
    }
  } catch {}
  // legacy fallback
  const r2 = await fetch(withDiagUrl("/api/lender-products"));
  const j2 = await r2.json();
  return (j2.products ?? []).map(fromLegacy);
}

/** QA helper: pulls staff products with ?diag=1 (if enabled) and logs provenance. */
export async function qaProvenance(): Promise<void> {
  try {
    const url = withDiagUrl("/api/lender-products"); // your client fetch proxy -> staff
    const res = await fetch(url, { credentials: "include" });
    const list = await res.json(); // legacy array
    if (!Array.isArray(list)) { console.warn("Unexpected shape", list); return; }
    const counts = summarizeProv(list);
    if (typeof window !== 'undefined') {
      console.table(counts);
      if (wantDiag()) downloadJSON("client_provenance_legacy.json", { counts, sample: list.slice(0,5) });
    }
  } catch (e) { console.warn("qaProvenance error", e); }
}