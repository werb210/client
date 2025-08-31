export type Category =
  | "line_of_credit"
  | "term_loan"
  | "equipment_financing"
  | "invoice_factoring"
  | "purchase_order_financing"
  | "working_capital";

export const CATEGORY_LABEL: Record<Category,string> = {
  line_of_credit: "Business Line of Credit",
  term_loan: "Term Loan",
  equipment_financing: "Equipment Financing",
  invoice_factoring: "Invoice Factoring",
  purchase_order_financing: "Purchase Order Financing",
  working_capital: "Working Capital",
};

export interface Product {
  id: string;
  name: string;
  category: Category | string; // tolerate unknowns but we'll filter to known
  country?: string;
  minAmount?: number;
  maxAmount?: number;
  lender_name?: string;
}

export interface CategoryGroup {
  key: Category;
  label: string;
  products: Product[];
  percentage: number;      // share of all eligible
  matchScore?: number;     // optional UI stat
}

export function normalizeCategory(raw: string): Category | null {
  const s = (raw || "").toLowerCase().replace(/\s+/g, "_");
  const map: Record<string,Category> = {
    line_of_credit: "line_of_credit",
    loc: "line_of_credit",
    term_loan: "term_loan",
    equipment_financing: "equipment_financing",
    invoice_factoring: "invoice_factoring",
    factoring: "invoice_factoring",
    purchase_order_financing: "purchase_order_financing",
    po_financing: "purchase_order_financing",
    working_capital: "working_capital",
    mca: "working_capital", // map MCA -> working capital bucket per request
  };
  return (map[s] ?? null);
}

export function groupByCategory(all: Product[], opts?: {country?: string; amount?: number}) : CategoryGroup[] {
  const known: Record<Category, Product[]> = {
    line_of_credit: [],
    term_loan: [],
    equipment_financing: [],
    invoice_factoring: [],
    purchase_order_financing: [],
    working_capital: [],
  };

  const eligible: Product[] = all.filter(p => {
    const cat = normalizeCategory(String(p.category));
    if (!cat) return false;

    // country/amount filtering (conservative; keep if unknown bounds)
    if (opts?.country && p.country && p.country !== opts.country) return false;
    const amount = opts?.amount ?? undefined;
    if (amount != null) {
      const minOk = p.minAmount == null || amount >= p.minAmount!;
      const maxOk = p.maxAmount == null || amount <= p.maxAmount!;
      if (!minOk || !maxOk) return false;
    }
    return true;
  });

  eligible.forEach(p => {
    const cat = normalizeCategory(String(p.category))!;
    known[cat].push(p);
  });

  const total = eligible.length || 1;
  const out: CategoryGroup[] = (Object.keys(known) as Category[]).map(key => ({
    key,
    label: CATEGORY_LABEL[key],
    products: known[key],
    percentage: Math.round((known[key].length / total) * 100),
  }));

  // sort most populated first
  out.sort((a,b) => b.products.length - a.products.length);
  return out;
}
