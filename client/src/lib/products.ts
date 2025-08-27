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

const norm = (x:any)=> (x??"").toString().trim().toUpperCase();
function toCanonical(p:any): CanonicalProduct {
  return {
    id: p.id,
    name: p.productName ?? p.name ?? "",
    lender_name: p.lenderName ?? null,
    country: ["CA","US"].includes(norm(p.countryOffered)) ? (norm(p.countryOffered) as any) : null,
    category: p.productCategory ?? null,
    min_amount: p.minimumLendingAmount ?? null,
    max_amount: p.maximumLendingAmount ?? null,
    active: (p.isActive ?? true) === true,
    required_documents: Array.isArray(p.required_documents) ? p.required_documents : [],
    min_time_in_business: p.min_time_in_business ?? null,
    min_monthly_revenue: p.min_monthly_revenue ?? null,
  };
}

export async function fetchProducts(): Promise<CanonicalProduct[]> {
  const r = await fetch("/api/v1/products", { credentials: "include" });
  if (r.ok) {
    const j = await r.json();
    if (Array.isArray(j)) return j.map(toCanonical);
  }
  // legacy fallback (optional)
  const r2 = await fetch("/api/lender-products");
  const j2 = await r2.json();
  return (j2.products ?? []).map((p:any)=>({
    id: p.id, name: p.name ?? p.productName ?? "", lender_name: p.lender_name ?? null,
    country: ["CA","US"].includes(norm(p.country)) ? (norm(p.country) as any) : null,
    category: p.category ?? p.productCategory ?? null,
    min_amount: p.min_amount ?? p.minimumLendingAmount ?? null,
    max_amount: p.max_amount ?? p.maximumLendingAmount ?? null,
    active: (p.active ?? p.isActive ?? true) === true,
    required_documents: Array.isArray(p.required_documents) ? p.required_documents : [],
    min_time_in_business: p.min_time_in_business ?? null,
    min_monthly_revenue: p.min_monthly_revenue ?? null,
  }));
}

// Legacy exports for backward compatibility
export type V1Product = CanonicalProduct;
export const fetchProductsV1 = fetchProducts;
export type RecommendationIntake = {
  country: "CA" | "US";
  amount: number;
  timeInBusinessMonths?: number;
  monthlyRevenue?: number;
  industry?: string;
};

// Legacy recommendation function - honors Staff constraints
export function recommend(intake: RecommendationIntake, products: CanonicalProduct[]) {
  const tib = intake.timeInBusinessMonths ?? 0;
  const rev = intake.monthlyRevenue ?? 0;
  return products.filter(p => {
    if (p.active === false) return false;
    if (p.country && p.country !== intake.country) return false;
    if (p.min_amount != null && intake.amount < p.min_amount) return false;
    if (p.max_amount != null && intake.amount > p.max_amount) return false;
    if (p.min_time_in_business != null && tib < p.min_time_in_business) return false;
    if (p.min_monthly_revenue != null && rev < p.min_monthly_revenue) return false;
    return true;
  }).sort((a,b) => {
    const ac = ((a.min_amount ?? intake.amount) + (a.max_amount ?? intake.amount))/2;
    const bc = ((b.min_amount ?? intake.amount) + (b.max_amount ?? intake.amount))/2;
    return Math.abs(ac - intake.amount) - Math.abs(bc - intake.amount);
  });
}

// Legacy required docs function - uses Staff product.required_documents
export function requiredDocsFor(p: CanonicalProduct): string[] {
  if (Array.isArray(p.required_documents) && p.required_documents.length > 0) return p.required_documents;
  return ["Bank Statements (6 months)", "Business Tax Returns"];
}

export function resolveDocs(p: CanonicalProduct): string[] {
  return requiredDocsFor(p);
}

// Submission types for backward compatibility
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

// Preflight validation before enabling Submit
export async function validateIntake(intake: Intake) {
  return getJSON<{ok:boolean; errors?:string[]; product?:CanonicalProduct; required_documents?:string[]}>(
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

// Cache versioning
export const CATALOG_SCHEMA_VERSION = "v1.3-country-nullable+staff-docs";
export function needCacheReset(stored?: string) { return stored !== CATALOG_SCHEMA_VERSION; }

// QA function
export async function qa() {
  const items = await fetchProducts();
  console.log("Products:", items.length);
  console.log("By country:", Object.entries(items.reduce((m,x)=>{const k=x.country??"NULL";m[k]=(m[k]||0)+1;return m;},{} as Record<string,number>)));
  if (items.some(x => x.max_amount === 9007199254740991)) throw new Error("MAX_SAFE_INTEGER leak detected");
}