// PURPOSE
// Make the client's "$50,000 in Canada — what categories could match?" call succeed,
// regardless of auth state and while the backend stabilizes.

export async function getMatchingCategories(amount: number, country: 'US'|'CA', opts?: {
  tenantId?: string;
  includeInactive?: boolean;   // default true to survive admin-inactive data
  token?: string;              // optional Bearer token if you have one
}) {
  const includeInactive = opts?.includeInactive ?? true;

  // 1) Try canonical endpoint (works without auth after Staff patch)
  const qs = new URLSearchParams({
    amount: String(amount),
    country,
    ...(opts?.tenantId ? { tenantId: opts.tenantId } : {}),
    ...(includeInactive ? { includeInactive: '1' } : {}),
  });
  const headers: Record<string,string> = { };
  if (opts?.token) headers['Authorization'] = `Bearer ${opts.token}`;

  const r = await fetch(`/api/catalog/categories?${qs.toString()}`, { credentials: 'include', headers });
  if (r.status === 412) {
    const j = await r.json().catch(()=>({}));
    throw Object.assign(new Error('ASK'), { type: 'ASK', asks: j.asks || [] });
  }
  if (r.ok) {
    const j = await r.json();
    if (Array.isArray(j.categories) && j.categories.length) return j.categories;
  }

  // 2) Fallback: legacy shim + local filter (works without auth)
  const lr = await fetch('/api/catalog/export-products?includeInactive=1', { credentials: 'include', headers });
  if (lr.ok) {
    const j = await lr.json().catch(()=>({}));
    const products: any[] = j.products || [];
    const cats = new Set<string>();
    for (const p of products) {
      const min = Number(p.min_amount ?? p.minimumLendingAmount ?? 0) || 0;
      const maxRaw = p.max_amount ?? p.maximumLendingAmount;
      const max = (maxRaw == null ? Infinity : Number(maxRaw) || 0);
      const cc = String(p.country ?? p.countryOffered ?? '').toUpperCase();
      const cat = p.category ?? p.productCategory;
      const active = p.active ?? p.is_active;
      // includeInactive=true shows categories even if admin hasn't flipped the toggle yet
      if (cc === country && min <= amount && amount <= max && (includeInactive ? (active !== false) : (active === true))) {
        if (typeof cat === 'string' && cat) cats.add(cat);
      }
    }
    return Array.from(cats).sort();
  }

  // 3) Last resort: nothing matched
  return [];
}