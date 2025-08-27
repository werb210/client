export type CanonicalProduct = {
  id: string;
  name: string;
  lender_name: string;
  country: "US" | "CA" | string;
  category: string;
  min_amount: number;
  max_amount: number;
  active: boolean;
  required_documents?: RequiredDoc[];
  // keep optional rate/term fields if you already use them
};

export type IntakeInput = {
  amount: number;
  country: "US" | "CA" | string;
  timeInBusinessMonths?: number;
  monthlyRevenue?: number;
  creditScore?: number;
  category?: string;
};

export type RequiredDocsInput = {
  category?: string;
  country?: string;
  amount?: number;
  lenderId?: string;
  timeInBusinessMonths?: number;
  monthlyRevenue?: number;
  creditScore?: number;
};

export type RequiredDoc =
  | { key: string; label: string; required: boolean; reason?: string; months?: number }
  | string;

// --- DEDUPE HELPERS ---
function uniqBy<T>(arr: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const k = key(x);
    if (!seen.has(k)) { seen.add(k); out.push(x); }
  }
  return out;
}

function dedupeProducts(products: CanonicalProduct[]): CanonicalProduct[] {
  // 1) strict by id, 2) soft by signature (name+lender+country+category+range)
  const strict = uniqBy(products, p => p.id);
  return uniqBy(strict, p =>
    `${(p.name||"").toLowerCase()}|${(p.lender_name||"").toLowerCase()}|${(p.country||"").toUpperCase()}|${(p.category||"").toLowerCase()}|${p.min_amount}|${p.max_amount}`
  );
}

function normalizeDocs(docs: RequiredDoc[] = []): RequiredDoc[] {
  // collapse strings → objects, lower-case by key/label, keep first required
  const asObjs = docs.map((d, i) =>
    typeof d === "string" ? { key: `doc_${i}`, label: d, required: true } : d
  );
  // guarantee bank_6m present exactly once
  const withMinimum = [{ key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 }, ...asObjs];
  return uniqBy(withMinimum, d => `${(d as any).key || ""}|${(d as any).label?.toLowerCase?.()||""}`);
}

// ---- Canonical fetch with safe fallback (v1 → catalog → legacy) -----------------
export async function fetchCatalogProducts(): Promise<CanonicalProduct[]> {
  try {
    const r = await fetch('/api/v1/products', { credentials: 'include' });
    if (r.ok) {
      const v1 = await r.json();
      if (Array.isArray(v1) && v1.length) {
        const mapped = v1.map((p: any) => ({
          id: p.id,
          name: p.productName,
          lender_name: p.lenderName,
          country: String(p.countryOffered || '').toUpperCase(),   // ← no default
          category: p.productCategory || '',
          min_amount: Number(p.minimumLendingAmount || 0),
          max_amount: Number(p.maximumLendingAmount || Number.MAX_SAFE_INTEGER),
          active: p.isActive !== false,
          required_documents: p.required_documents,
        }));
        return dedupeProducts(mapped);
      }
    }
  } catch {/* fall back */}
  
  try {
    const r = await fetch("/api/v1/products", { credentials: "include" });
    if (r.ok) {
      const j = await r.json();
      const items = j?.products ?? j ?? [];
      if (Array.isArray(items) && items.length) {
        const mapped = items.map((p: any) => ({
          id: p.id,
          name: p.name ?? p.productName,
          lender_name: p.lender_name ?? p.lenderName,
          country: String(p.country ?? p.countryOffered ?? "").toUpperCase(),
          category: p.category ?? p.productCategory ?? "",
          min_amount: Number(p.min_amount ?? p.minimumLendingAmount ?? 0),
          max_amount: Number(p.max_amount ?? p.maximumLendingAmount ?? Number.MAX_SAFE_INTEGER),
          active: (p.active ?? p.isActive) !== false,
          required_documents: p.required_documents,
        }));
        return dedupeProducts(mapped);
      }
    }
  } catch {/* fall back */}
  
  // Legacy fallback
  const r2 = await fetch("/api/lender-products", { credentials: "include" });
  const j2 = await r2.json();
  const items2 = j2?.products ?? [];
  const mapped = (items2 as any[]).map((p: any) => ({
    id: p.id,
    name: p.productName ?? p.name,
    lender_name: p.lenderName ?? p.lender_name,
    country: String(p.countryOffered ?? p.country ?? "").toUpperCase(),
    category: p.productCategory ?? p.category ?? "",
    min_amount: Number(p.minimumLendingAmount ?? p.min_amount ?? 0),
    max_amount: Number(p.maximumLendingAmount ?? p.max_amount ?? Number.MAX_SAFE_INTEGER),
    active: (p.isActive ?? p.active) !== false,
    required_documents: p.required_documents,
  }));
  return dedupeProducts(mapped);
}

// ---- Step 2: recommendations ------------------------------------------------
export type CategoryRecommendation = { category: string; products: CanonicalProduct[] };

export async function recommendProducts(intake: IntakeInput): Promise<CategoryRecommendation[]> {
  const all = await fetchCatalogProducts();
  const amt = intake.amount;
  const cc = String(intake.country).toUpperCase();

  const eligible = all.filter(p =>
    (p.country === cc) &&  // ← strict country match
    p.active &&
    p.min_amount <= amt && amt <= p.max_amount
  );

  // simple score: closer max_amount is better
  const scored = eligible
    .map(p => ({ p, score: Math.abs((p.max_amount ?? Number.MAX_SAFE_INTEGER) - amt) }))
    .sort((a, b) => a.score - b.score)
    .map(s => s.p);

  const byCat = new Map<string, CanonicalProduct[]>();
  for (const p of scored) {
    const k = p.category || "Working Capital";
    if (!byCat.has(k)) byCat.set(k, []);
    byCat.get(k)!.push(p);
  }
  return Array.from(byCat.entries()).map(([category, products]) => ({ category, products }));
}

// ---- Step 5: required documents (Staff-first with guaranteed fallback) -----
const DOCS_FALLBACK: Record<string, RequiredDoc[]> = {
  "Working Capital": [
    { key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 },
  ],
  "Business Line of Credit": [
    { key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 },
  ],
  "Term Loan": [
    { key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 },
  ],
  "Equipment Financing": [
    { key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 },
  ],
  "Invoice Factoring": [
    { key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 },
  ],
  "Purchase Order Financing": [
    { key: "bank_6m", label: "Last 6 months bank statements", required: true, months: 6 },
  ],
};

export async function listDocuments(input: RequiredDocsInput): Promise<RequiredDoc[]> {
  try {
    const r = await fetch("/api/required-docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
    if (r.ok) {
      const j = await r.json();
      const docs = j?.documents ?? j?.requiredDocs ?? j?.data ?? [];
      if (Array.isArray(docs) && docs.length) return docs as RequiredDoc[];
    }
  } catch { /* fall through */ }
  const cat = input.category ?? "Working Capital";
  return normalizeDocs(DOCS_FALLBACK[cat] ?? DOCS_FALLBACK["Working Capital"]);
}

// ---- Staff App Integration Endpoints -----------------------------------------------

export const createApplication = async (data: FormData) => {
  const res = await fetch(`/api/applications`, {
    method: "POST",
    body: data,
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to create application");
  return res.json();
};

export const getRecommendations = async (id: string) => {
  const res = await fetch(`/api/applications/${id}/recommendations`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to get recommendations");
  return res.json();
};

export const getRequiredDocuments = async (id: string) => {
  const res = await fetch(`/api/applications/${id}/required-documents`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to fetch required documents");
  return res.json();
};