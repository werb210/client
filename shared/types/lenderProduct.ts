// A) Shared TypeScript types (put in a shared types/schema.ts)
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

// C) Client display helpers
export const fmtRange = (min: number | null, max: number | null) => {
  if (min == null && max == null) return 'Not provided';
  const fmt = (n: number | null) => n == null ? '—' : `$${n.toLocaleString()}`;
  return `${fmt(min)} – ${fmt(max)}`;
};

// B) Client fetch (expects Staff API to use the view/join above)
export async function fetchLenderProducts(tenantId?: string): Promise<LenderProduct[]> {
  const qs = tenantId ? `?tenantId=${tenantId}` : '';
  const res = await fetch(`/api/crm/lender-products${qs}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load lender products: ${res.status}`);
  const items = await res.json();
  // Guard: normalize null/0 amounts for display
  return items.map((p: any) => ({
    ...p,
    min_amount: p.min_amount ?? null,
    max_amount: p.max_amount ?? null,
  }));
}