// Fix pack 1 — Types aligned to Staff V1
export type V1Product = {
  id: string;
  productName: string;
  lenderName: string;
  countryOffered: string | null;        // no 'US' default
  productCategory: string | null;       // no 'Working Capital' default
  minimumLendingAmount: number | null;  // no 0 default
  maximumLendingAmount: number | null;  // no MAX default
  isActive: boolean | null;
  min_time_in_business: number | null;  // NEW
  min_monthly_revenue: number | null;   // NEW
  excluded_industries: string[];        // NEW
  required_documents: string[] | null;  // NEW
};

// Fix pack 2 — Single-source fetch (V1 first, legacy only if V1 unavailable)
function normCountry(c: any): string | null {
  const v = typeof c === "string" ? c.trim().toUpperCase() : "";
  return v || null;
}
function normalize(list: V1Product[]): V1Product[] {
  return list.map(p => ({
    ...p,
    countryOffered: normCountry(p.countryOffered),
    productCategory: (p.productCategory?.trim() || null),
    minimumLendingAmount: p.minimumLendingAmount ?? null,
    maximumLendingAmount: p.maximumLendingAmount ?? null,
  }));
}
export async function fetchProductsV1(): Promise<V1Product[]> {
  const hit = async (url: string) => {
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) throw new Error(`${url} ${r.status}`);
    return r.json();
  };
  try {
    const v1 = await hit("/api/v1/products") as V1Product[];
    return normalize(v1);
  } catch {
    const legacy = await hit("/api/lender-products") as { products: any[] };
    const v1ish = (legacy.products ?? []).map(p => ({
      id: p.id,
      productName: p.name ?? p.productName ?? "",
      lenderName: p.lender_name ?? p.lenderName ?? p.name ?? "",
      countryOffered: p.country ?? p.countryOffered ?? null,
      productCategory: p.category ?? p.productCategory ?? null,
      minimumLendingAmount: p.min_amount ?? p.minimumLendingAmount ?? null,
      maximumLendingAmount: p.max_amount ?? p.maximumLendingAmount ?? null,
      isActive: typeof p.active === "boolean" ? p.active :
                typeof p.isActive === "boolean" ? p.isActive : null,
      min_time_in_business: p.min_time_in_business ?? null,
      min_monthly_revenue: p.min_monthly_revenue ?? null,
      excluded_industries: p.excluded_industries ?? [],
      required_documents: p.required_documents ?? null,
    })) as V1Product[];
    return normalize(v1ish);
  }
}

// Alias for backward compatibility
export const fetchProductsStable = fetchProductsV1;

// Fix pack 3 — Step 2 uses Staff constraints (no guesses)
export type RecommendationIntake = {
  country: "US" | "CA";
  amount: number;
  timeInBusinessMonths?: number;
  monthlyRevenue?: number;
  industry?: string;
};
export function recommend(intake: RecommendationIntake, products: V1Product[]) {
  const tib = intake.timeInBusinessMonths ?? 0;
  const rev = intake.monthlyRevenue ?? 0;
  return products.filter(p => {
    if (p.isActive === false) return false;
    if (p.countryOffered && p.countryOffered !== intake.country) return false;
    if (p.minimumLendingAmount != null && intake.amount < p.minimumLendingAmount) return false;
    if (p.maximumLendingAmount != null && intake.amount > p.maximumLendingAmount) return false;
    if (p.min_time_in_business != null && tib < p.min_time_in_business) return false;
    if (p.min_monthly_revenue != null && rev < p.min_monthly_revenue) return false;
    if (intake.industry && (p.excluded_industries || []).includes(intake.industry)) return false;
    return true;
  }).sort((a,b) => {
    const ac = ((a.minimumLendingAmount ?? intake.amount) + (a.maximumLendingAmount ?? intake.amount))/2;
    const bc = ((b.minimumLendingAmount ?? intake.amount) + (b.maximumLendingAmount ?? intake.amount))/2;
    return Math.abs(ac - intake.amount) - Math.abs(bc - intake.amount);
  });
}

// Fix pack 4 — Step 5 uses Staff docs; tiny fallback only if missing
export function requiredDocsFor(p: V1Product): string[] {
  if (Array.isArray(p.required_documents) && p.required_documents.length > 0) return p.required_documents;
  return ["Last 6 months bank statements"]; // minimal baseline only if Staff provided none
}

// Fix pack 5 — cache/version guard to purge any stale "US-only" data
export const CATALOG_SCHEMA_VERSION = "v1.3-country-nullable+staff-docs";
export function needCacheReset(stored?: string) { return stored !== CATALOG_SCHEMA_VERSION; }

// PURPOSE: Keep the submission payload 1:1 with Staff data. No defaulting country/category/amounts.
// Preflight validation against /api/applications/validate-intake before enabling Submit.
// Include product SNAPSHOT fields the UI actually used.

export type Intake = {
  product_id: string;
  country: "US" | "CA";
  amount: number;
  timeInBusinessMonths?: number;
  monthlyRevenue?: number;
  industry?: string;
};

async function getJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { credentials: "include", ...init });
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return r.json();
}

// Enhanced fetchProductsV1 with proper normalization (updated version)

// Step 5 docs: prefer Staff-provided docs, minimal fallback otherwise
export function resolveDocs(p: V1Product): string[] {
  if (Array.isArray(p.required_documents) && p.required_documents.length) return p.required_documents;
  return ["Last 6 months bank statements"];
}

// Preflight validation before enabling Submit
export async function validateIntake(intake: Intake) {
  return getJSON<{ok:boolean; errors?:string[]; product?:V1Product; required_documents?:string[]}>(
    "/api/applications/validate-intake",
    { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(intake) }
  );
}

// Final submit (server re-validates & stores product snapshot)
export async function submitApplication(intake: Intake) {
  const v = await validateIntake(intake);
  if (!v.ok) throw new Error((v.errors||["validation failed"]).join("; "));
  const r = await getJSON<{ok:boolean; id:string}>(
    "/api/applications",
    { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(intake) }
  );
  return r.id;
}

// Quick QA (optional)
export async function qa() {
  const items = await fetchProductsV1();
  console.log("Products:", items.length);
  console.log("By country:", Object.entries(items.reduce((m,x)=>{const k=x.countryOffered??"NULL";m[k]=(m[k]||0)+1;return m;},{} as Record<string,number>)));
  if (items.some(x => x.maximumLendingAmount === 9007199254740991)) throw new Error("MAX_SAFE_INTEGER leak detected");
}