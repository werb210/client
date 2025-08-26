// PURPOSE
// Your "Complete Lender Product Database (42 US-only, same $10k–$5M)" output
// is almost certainly from a stale/static source. This client patch:
//  1) Forces live fetch from /api/lender-products (hardened shim).
//  2) Detects stub/uniform datasets and BLOCKS with an ASK.
//  3) Provides a typed row model and renders correct fields.

// ---- types ----
export type LenderProductRow = {
  id: string;
  name: string;
  lender_name?: string;
  country: 'US'|'CA';
  category: string;
  min_amount: number|null;
  max_amount: number|null;
  active: boolean|null;
  // legacy aliases may exist but we ignore them for rendering
};

// ---- fetch live list ----
export async function fetchAllLenderProducts(): Promise<LenderProductRow[]> {
  const r = await fetch('/api/lender-products', { credentials: 'include' });
  if (!r.ok) throw new Error(`/api/lender-products failed: ${r.status}`);
  const j = await r.json();
  const rows = (j.products || []).map((p:any) => ({
    id: p.id, name: p.name, country: p.country, category: p.category,
    min_amount: p.min_amount, max_amount: p.max_amount, active: p.active,
  })) as LenderProductRow[];

  // stub/uniform detector
  const countries = new Set(rows.map(r => r.country));
  const categories = new Set(rows.map(r => r.category));
  const minSet = new Set(rows.map(r => String(r.min_amount)));
  const maxSet = new Set(rows.map(r => String(r.max_amount)));
  const looksStub =
    rows.length > 0 &&
    (countries.size === 1 || categories.size === 1) &&
    (minSet.size === 1 && maxSet.size === 1);

  if (looksStub) {
    const msg =
      `ASK: Dataset appears uniform (countries=${[...countries].join(',')}, ` +
      `categories=${[...categories].join(',')}, min=${[...minSet][0]}, max=${[...maxSet][0]}). ` +
      `This usually means a static/stub source. Please re-fetch from Staff after running /api/catalog/sanity.`;
    const err:any = new Error(msg);
    err.type = 'ASK';
    err.asks = [msg];
    throw err;
  }
  return rows;
}

// ---- render helper ----
export function currency(n: number|null) {
  if (n == null) return '—';
  return `$${n.toLocaleString()}`;
}