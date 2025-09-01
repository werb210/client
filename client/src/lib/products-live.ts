import { getProducts } from "../api/products";
// PURPOSE
// 1) List *live* lender products from Staff's new export endpoint with exact fields.
// 2) Show total count and a nice table.
// 3) No reliance on legacy names; optional guard to allow uniform data when auditing.

export type LenderProductRow = {
  id: string;
  product_name: string;
  lender_name: string | null;
  country: 'US'|'CA';
  min_amount: number|null;
  max_amount: number|null;
  category: string;
  active: boolean|null;
};

export async function fetchLenderProductsLive(opts?: { /* ensure products fetched */ 
  country?: 'US'|'CA';
  amount?: number;
  lenderId?: string;
  includeInactive?: boolean;  // default true (audit-friendly)
  allowUniform?: boolean;     // set true for audits to display even if uniform
}): Promise<{ total:number; products:LenderProductRow[] }> {
  const qs = new URLSearchParams({
    ...(opts?.country ? { country: opts.country } : {}),
    ...(opts?.amount != null ? { amount: String(opts.amount) } : {}),
    ...(opts?.lenderId ? { lenderId: opts.lenderId } : {}),
    ...(opts?.includeInactive ?? true ? { includeInactive: '1' } : {}),
  });
  const r = await fetch(`/api/v1/products?${qs.toString()}`);
  if (!r.ok) throw new Error(`/api/v1/products failed: ${r.status}`);
  const j = await r.json();
  const rows = (j.products || []) as LenderProductRow[];

  // Optional stub/uniform detection (can be bypassed for audits)
  if (!opts?.allowUniform) {
    const countries = new Set(rows.map(r => r.country));
    const categories = new Set(rows.map(r => r.category));
    const minSet = new Set(rows.map(r => String(r.min_amount)));
    const maxSet = new Set(rows.map(r => String(r.max_amount)));
    const looksStub = rows.length > 0 && (countries.size === 1 || categories.size === 1) && (minSet.size === 1 && maxSet.size === 1);
    if (looksStub) {
      const msg =
        `ASK: Dataset appears uniform (countries=${[...countries].join(',')}, ` +
        `categories=${[...categories].join(',')}, min=${[...minSet][0]}, max=${[...maxSet][0]}). ` +
        `Confirm Staff data via /api/catalog/country-counts and re-import if needed.`;
      const err:any = new Error(msg); err.type='ASK'; err.asks=[msg]; throw err;
    }
  }
  return { total: Number(j.total||rows.length), products: rows };
}