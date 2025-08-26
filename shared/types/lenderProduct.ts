// Shared types for Staff & Client (to prevent drift)
export type Lender = {
  id: string;
  name: string;
  tenant_id: string;
  active: boolean;
};

export type LenderProduct = {
  id: string;
  name: string;
  lender_id: string;
  lender_name?: string;
  tenant_id: string;
  country: 'US' | 'CA';
  category:
    | 'Business Line of Credit'
    | 'Term Loan'
    | 'Equipment Financing'
    | 'Invoice Factoring'
    | 'Purchase Order Financing'
    | 'Working Capital'
    | 'Asset-Based Lending'
    | 'SBA Loan';
  min_amount: number | null;
  max_amount: number | null;
  active: boolean;
};

// Render amounts helper that treats NULL as "Not provided" (no more $0–$0)
export const fmtRange = (min: number | null, max: number | null) => {
  if (min == null && max == null) return 'Not provided';
  const fmt = (n: number | null) => n == null ? '—' : `$${n.toLocaleString()}`;
  return `${fmt(min)} – ${fmt(max)}`;
};

// Client fetch function for lender products
export async function fetchLenderProducts(tenantId?: string): Promise<LenderProduct[]> {
  const qs = tenantId ? `?tenantId=${tenantId}` : '';
  const res = await fetch(`/api/lender-products${qs}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load lender products: ${res.status}`);
  const data = await res.json();
  const items = data.products || [];
  
  // Transform staff API response to match LenderProduct shape
  return items.map((p: any) => ({
    id: p.id,
    name: p.productName || p.name,
    lender_id: p.lender_id || 'unknown',
    lender_name: p.lenderName || p.lender_name,
    tenant_id: p.tenant_id || 'default',
    country: (p.countryOffered || p.country) as 'US' | 'CA',
    category: p.productCategory || p.category,
    min_amount: p.minimumLendingAmount ?? p.min_amount ?? null,
    max_amount: p.maximumLendingAmount ?? p.max_amount ?? null,
    active: p.isActive ?? p.active ?? true
  }));
}