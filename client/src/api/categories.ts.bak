/**
 * Category helpers for Step 2.
 * Canonical categories: term_loan, line_of_credit, equipment_financing, mca, working_capital,
 * (optional) invoice_factoring, purchase_order_financing
 */
export type CanonicalCategory =
  | "term_loan"
  | "line_of_credit"
  | "equipment_financing"
  | "mca"
  | "working_capital"
  | "invoice_factoring"
  | "purchase_order_financing";

const MAP: Record<string, CanonicalCategory> = {
  "term loan": "term_loan",
  "term_loans": "term_loan",
  "term_loan": "term_loan",
  "loc": "line_of_credit",
  "line of credit": "line_of_credit",
  "line_of_credit": "line_of_credit",
  "equipment financing": "equipment_financing",
  "equipment_finance": "equipment_financing",
  "equipment_financing": "equipment_financing",
  "mca": "mca",
  "merchant cash advance": "mca",
  "working capital": "working_capital",
  "working_capital": "working_capital",
  "invoice factoring": "invoice_factoring",
  "invoice_factoring": "invoice_factoring",
  "purchase order financing": "purchase_order_financing",
  "purchase_order_financing": "purchase_order_financing",
};

export function canonicalizeCategory(raw?: string): CanonicalCategory | undefined {
  if (!raw) return;
  const k = String(raw).trim().toLowerCase().replace(/\s+/g, ' ');
  return MAP[k] ?? MAP[k.replace(/\s/g,'_')];
}

export type Product = {
  id: string;
  name?: string;
  lender_name?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  country?: string;
};

export type CategorySummary = {
  key: CanonicalCategory;
  label: string;
  count: number;
  lenders: number;
  minAmount: number | null;
  maxAmount: number | null;
};

export function summarizeCategories(products: Product[]): CategorySummary[] {
  const byKey = new Map<CanonicalCategory, { setIds:Set<string>, setLenders:Set<string>, min:number|null, max:number|null }>();
  const label = (k:CanonicalCategory) => ({
    term_loan: "Term Loan",
    line_of_credit: "Line of Credit",
    equipment_financing: "Equipment Financing",
    mca: "Merchant Cash Advance",
    working_capital: "Working Capital",
    invoice_factoring: "Invoice Factoring",
    purchase_order_financing: "Purchase Order Financing",
  }[k]);

  for (const p of products) {
    const key = canonicalizeCategory(p.category);
    if (!key) continue;
    if (!byKey.has(key)) byKey.set(key, { setIds:new Set(), setLenders:new Set(), min:null, max:null });
    const bucket = byKey.get(key)!;
    bucket.setIds.add(p.id);
    if (p.lender_name) bucket.setLenders.add(p.lender_name);
    const lo = typeof p.minAmount === 'number' ? p.minAmount : null;
    const hi = typeof p.maxAmount === 'number' ? p.maxAmount : null;
    bucket.min = (bucket.min==null) ? lo : (lo==null ? bucket.min : Math.min(bucket.min, lo));
    bucket.max = (bucket.max==null) ? hi : (hi==null ? bucket.max : Math.max(bucket.max, hi));
  }

  return Array.from(byKey.entries()).map(([key, v]) => ({
    key,
    label: label(key),
    count: v.setIds.size,
    lenders: v.setLenders.size,
    minAmount: v.min,
    maxAmount: v.max,
  })).sort((a,b)=> a.label.localeCompare(b.label));
}
