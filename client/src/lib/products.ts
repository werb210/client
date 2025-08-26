/* Normalized catalog types */
export type RawProduct = any;

export type LenderProduct = {
  id: string;
  name: string;
  lenderId?: string | null;
  lenderName?: string | null;
  country: "US" | "CA";
  category: string;                 // never default to "Working Capital"
  min_amount: number | null;
  max_amount: number | null;
  active: boolean;
};

const toNum = (v: unknown, orNull = true): number | null => {
  if (v === null || v === undefined || v === "") return orNull ? null : 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : (orNull ? null : 0);
};

const up = (s: unknown) => String(s ?? "").trim().toUpperCase();

/** Normalize any server/product shape to our LenderProduct */
export function normalizeProduct(p: RawProduct): LenderProduct {
  const country = up(p.country ?? p.countryOffered);
  const categoryRaw =
    p.category ??
    p.productCategory ??
    p.category_name ??
    p.product_category ??
    "";

  return {
    id: String(p.id ?? p.productId ?? cryptoRandom()),
    name: String(p.name ?? p.product_name ?? p.productName ?? "Unnamed Product"),
    lenderId: p.lender_id ?? p.lenderId ?? null,
    lenderName: p.lender_name ?? p.lenderName ?? null,
    country: (country === "CA" ? "CA" : "US") as "US" | "CA",
    // IMPORTANT: do NOT default to "Working Capital" — use "Unknown" if missing
    category: String(categoryRaw || "Unknown"),
    min_amount: toNum(p.min_amount ?? p.minimumLendingAmount),
    max_amount: toNum(p.max_amount ?? p.maximumLendingAmount),
    active: Boolean(p.active ?? p.is_active ?? p.isActive ?? true),
  };
}

const cryptoRandom = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : "p_" + Math.random().toString(36).slice(2));

/** Fetch full catalog (prefers Staff public export; falls back to legacy) */
export async function fetchCatalogNormalized(): Promise<LenderProduct[]> {
  // 1) Preferred: Staff public export
  try {
    const r = await fetch("/api/catalog/export-products?includeInactive=1", {
      credentials: "include",
    });
    if (r.ok) {
      const j = await r.json();
      const rows = (j.products ?? j.data ?? j) as RawProduct[];
      if (Array.isArray(rows) && rows.length) {
        return rows.map(normalizeProduct);
      }
    }
  } catch { /* fall through */ }

  // No fallback - catalog only
  return [];
}

/** Get unique categories that match amount+country */
export async function getMatchingCategories(params: {
  amount: number;
  country: "US" | "CA";
}): Promise<string[]> {
  const { amount, country } = params;
  const all = await fetchCatalogNormalized();

  const cats = new Set<string>();
  for (const p of all) {
    if (p.country !== country) continue;
    const min = p.min_amount ?? 0;
    const max = p.max_amount ?? Number.POSITIVE_INFINITY;
    if (amount >= min && amount <= max) {
      // Only accept non-empty, non-"Unknown" categories
      if (p.category && p.category.toLowerCase() !== "unknown") cats.add(p.category);
    }
  }
  return Array.from(cats).sort();
}

/** Convenience: products matching amount+country for Step 2 */
export async function getProductsForStep2(params: {
  amount: number;
  country: "US" | "CA";
}): Promise<LenderProduct[]> {
  const { amount, country } = params;
  const all = await fetchCatalogNormalized();
  return all.filter((p) => {
    if (p.country !== country) return false;
    const min = p.min_amount ?? 0;
    const max = p.max_amount ?? Number.POSITIVE_INFINITY;
    return amount >= min && amount <= max;
  });
}