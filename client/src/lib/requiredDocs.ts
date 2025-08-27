import type { CanonicalProduct } from "./products";

const FALLBACK: Record<string,string[]> = {
  "Equipment Financing": ["Equipment Quote","Bank Statements (6 months)","Business Tax Returns"],
  "Business Line of Credit": ["Bank Statements (6 months)","Financial Statements","Business Tax Returns"],
  "Working Capital": ["Bank Statements (6 months)","Financial Statements","Cash Flow Statement"],
  "Term Loan": ["Bank Statements (6 months)","Business Tax Returns","Financial Statements"],
  "Invoice Factoring": ["A/R Aging","Bank Statements (3–6 months)","Customer List"],
  "Purchase Order Financing": ["Purchase Order(s)","Supplier Quote","Bank Statements (3–6 months)"],
};

export function docsFor(product: CanonicalProduct): string[] {
  if (product.required_documents && product.required_documents.length) return product.required_documents;
  const key = product.category ?? "Working Capital";
  return FALLBACK[key] ?? ["Bank Statements (6 months)", "Business Tax Returns"];
}