import type { Category } from "./categories";

export type DocKey =
  | "bank_statements_6m"
  | "financial_statements"
  | "tax_returns_3y"
  | "equipment_quote"
  | "ar_aging"
  | "invoice_samples"
  | "po_documents"
  | "personal_financial_statement";

export const DOC_LABEL: Record<DocKey,string> = {
  bank_statements_6m: "Bank Statements (last 6 months)",
  financial_statements: "Financial Statements (P&L + Balance Sheet)",
  tax_returns_3y: "Business Tax Returns (last 3 years)",
  equipment_quote: "Equipment Quote",
  ar_aging: "A/R Aging",
  invoice_samples: "Invoice Samples",
  po_documents: "Purchase Orders & Customer Credit Info",
  personal_financial_statement: "Personal Financial Statement (if ≥50% owner)",
};

const CORE: DocKey[] = ["bank_statements_6m","financial_statements","tax_returns_3y"];

const BY_CATEGORY: Record<Category, DocKey[]> = {
  line_of_credit: [],
  term_loan: [],
  equipment_financing: ["equipment_quote"],
  invoice_factoring: ["ar_aging","invoice_samples"],
  purchase_order_financing: ["po_documents"],
  working_capital: [],
};

export function docsForCategory(cat: Category | null | undefined): DocKey[] {
  const extra = cat ? (BY_CATEGORY[cat] || []) : [];
  return Array.from(new Set([...CORE, ...extra]));
}
