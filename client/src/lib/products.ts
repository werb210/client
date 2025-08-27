export type V1Product = {
  id: string;
  productName: string;
  lenderName: string;
  countryOffered: string;
  productCategory: string;
  minimumLendingAmount?: number|null;
  maximumLendingAmount?: number|null;
  isActive?: boolean|null;
};

export async function fetchProductsStable(): Promise<V1Product[]> {
  // Primary: V1 (staff server-provided, public)
  const v1 = await fetch('/api/v1/products', { credentials:'include' });
  if (v1.ok) {
    const arr = await v1.json();
    if (Array.isArray(arr) && arr.length) return arr as V1Product[];
  }
  // Fallback: hardened legacy shim (mapped from V1 server-side)
  const leg = await fetch('/api/lender-products', { credentials:'include' });
  if (leg.ok) {
    const j = await leg.json();
    const arr = Array.isArray(j?.products) ? j.products.map((p:any):V1Product => ({
      id: p.id,
      productName: p.name ?? p.productName,
      lenderName: p.lender_name ?? p.lenderName,
      countryOffered: String(p.country ?? p.countryOffered ?? '').toUpperCase(),
      productCategory: p.category ?? p.productCategory,
      minimumLendingAmount: p.min_amount ?? p.minimumLendingAmount ?? null,
      maximumLendingAmount: p.max_amount ?? p.maximumLendingAmount ?? null,
      isActive: (p.active ?? p.isActive ?? true),
    })) : [];
    if (arr.length) return arr;
  }
  return [];
}