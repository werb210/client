import crypto from "crypto";

export type Canonical = {
  id: string;
  name: string;
  lender_name: string;
  country: "CA"|"US"|string;
  category: string;
  min_amount: number;
  max_amount: number;
  active: boolean;
  updated_at: string;
  // NEW: expose Staff fields that were previously lost
  min_time_in_business?: number;
  min_monthly_revenue?: number;
  excluded_industries?: string[];
  required_documents?: string[];
};

const STATE: { data: Canonical[]; ts: number; sig: string } = { data: [], ts: 0, sig: "" };

const normCountry = (c = "") =>
  String(c).trim().toUpperCase()
    .replace("CANADA","CA")
    .replace("UNITED STATES","US");

function toCanonical(p: any): Canonical {
  // IMPORTANT: never force 'US' on missing/empty values
  const countryRaw = p.country ?? p.countryOffered ?? "";
  const country = normCountry(countryRaw);
  
  return {
    id: String(p.id),
    name: p.name ?? p.productName ?? "",
    lender_name: p.lender_name ?? p.lenderName ?? p.name ?? "", // Staff uses 'name' as lender name
    country: country || null, // Keep null for missing countries, don't default to US
    category: p.category ?? p.productCategory ?? "Working Capital",
    min_amount: Number(p.min_amount ?? p.minimumLendingAmount ?? 0),
    max_amount: Number(p.max_amount ?? p.maximumLendingAmount ?? 0),
    active: Boolean(p.active ?? p.isActive ?? true),
    updated_at: new Date().toISOString(),
    // NEW: preserve Staff fields that were previously lost
    min_time_in_business: p.min_time_in_business ?? null,
    min_monthly_revenue: p.min_monthly_revenue ?? null,
    excluded_industries: p.excluded_industries ?? null,
    required_documents: p.required_documents ?? null,
  };
}

function signature(items: Canonical[]): string {
  const base = items.map(i=>[i.id,i.country,i.category,i.min_amount,i.max_amount,i.active?1:0].join("|")).sort().join("\n");
  return crypto.createHash("sha256").update(base).digest("hex");
}

export function replaceAll(incoming: any[]): { saved: number; CA: number; US: number; sig: string } {
  const normalized = (Array.isArray(incoming) ? incoming : []).map(toCanonical);
  const canon = normalized.filter(p => p.name && p.lender_name && p.category);

  const CA = canon.filter(p => p.country === "CA").length;
  const US = canon.filter(p => p.country === "US").length;

  STATE.data = canon;
  STATE.ts = Date.now();
  STATE.sig = signature(canon);

  return { saved: canon.length, CA, US, sig: STATE.sig };
}

export function getAll(): Canonical[] {
  return STATE.data;
}

export function getCacheStats() {
  return {
    productsCount: STATE.data.length,
    lastUpdated: new Date(STATE.ts).toISOString(),
    signature: STATE.sig,
    countries: {
      CA: STATE.data.filter(p => p.country === "CA").length,
      US: STATE.data.filter(p => p.country === "US").length
    }
  };
}

// Pull function to fetch from staff backend and populate catalog
export async function pullFromStaffBackend(): Promise<{ saved: number; CA: number; US: number; sig: string }> {
  try {
    console.log("🔄 Pulling lender products from staff backend...");
    
    // Use a more direct approach with axios-like functionality
    const response = await fetch("https://staff.boreal.financial/api/lender-products", {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'client-app-initial-sync',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Staff backend response: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let products = [];

    // Handle different response formats
    if (data.products && Array.isArray(data.products)) {
      products = data.products;
    } else if (Array.isArray(data)) {
      products = data;
    } else {
      throw new Error(`Unexpected response format: ${JSON.stringify(data).substring(0, 200)}`);
    }

    const result = replaceAll(products);
    console.log(`✅ Pulled ${result.saved} products from staff backend (CA: ${result.CA}, US: ${result.US})`);
    return result;

  } catch (error: any) {
    console.error("❌ Failed to pull from staff backend:", {
      message: error.message,
      stack: error.stack?.substring(0, 300),
      cause: error.cause
    });
    throw error;
  }
}

// Legacy compatibility function
export async function getLenderProducts(): Promise<Canonical[]> {
  return getAll();
}