// CLIENT APP: shared types, fetchers that match Staff API/view, and display helpers.
// Types kept in lockstep with crm_lender_products_canon (+ lender_name join)

export type LenderProduct = {
  id: string;
  name: string; // Primary product name field (matches API)
  lender_name: string;
  country: 'US' | 'CA' | string | null;
  category: string;
  min_amount: number;
  max_amount: number;
  active: boolean;
  updated_at: string;
  min_time_in_business?: number | null;
  min_monthly_revenue?: number | null;
  excluded_industries?: string[];
  required_documents?: string[];
  geography?: string[] | string | null;

  // Legacy fields for backward compatibility with old schema
  product_name?: string; // maps to name
  lender_id?: string;
  tenant_id?: string;
  interest_rate_min?: number | null;
  interest_rate_max?: number | null;
  term_min?: number | null;
  term_max?: number | null;
  custom_requirements?: string;
  variant_sig?: string;
};

export type LenderCount = {
  lender_id: string;
  lender_name: string;
  tenant_id: string;
  total_any: number;
  with_category: number;
  active_only: number;
  ui_filtered: number;
};

// Fetchers: expect Staff API to expose endpoints backed by the views
// /api/crm/lender-products -> SELECT c.*, l.name AS lender_name FROM crm_lender_products_canon c LEFT JOIN lenders l ON l.id=c.lender_id WHERE (?tenantId)
export async function fetchLenderProducts(tenantId?: string): Promise<LenderProduct[]> {
  const qs = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
  const res = await fetch(`/api/crm/lender-products${qs}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load lender products: ${res.status}`);
  const items = (await res.json()) as LenderProduct[];
  return items.map(p => ({
    ...p,
    // ensure nulls for missing amounts so UI doesn't render $0–$0
    min_amount: p.min_amount ?? null,
    max_amount: p.max_amount ?? null,
  }));
}

// /api/crm/lender-counts -> SELECT * FROM crm_lender_counts
export async function fetchLenderCounts(): Promise<LenderCount[]> {
  const res = await fetch(`/api/crm/lender-counts`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load lender counts: ${res.status}`);
  return (await res.json()) as LenderCount[];
}

// UI helpers
export const formatCurrencyRange = (min: number | null, max: number | null) => {
  const fmt = (n: number | null) => (n == null ? '—' : `$${n.toLocaleString()}`);
  if (min == null && max == null) return 'Not provided';
  return `${fmt(min)} – ${fmt(max)}`;
};