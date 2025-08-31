import type { Intake, Step2Selection } from '@/lib/appState';

export type DocKey =
  | 'bank_statements_6m'
  | 'tax_returns_3y'
  | 'financial_statements'
  | 'personal_financial_statement'
  | 'pg_authorization'
  | 'equipment_quote'
  | 'ar_aging'
  | 'invoice_samples'
  | 'po_documents';

export type DocRequirement = { key: DocKey; label: string; required: boolean };

const LABELS: Record<DocKey,string> = {
  bank_statements_6m:        'Bank Statements (last 6 months)',
  tax_returns_3y:            'Business Tax Returns (3 years)',
  financial_statements:      'Financial Statements (P&L & Balance Sheet)',
  personal_financial_statement:'Personal Financial Statement',
  pg_authorization:          'Personal Guarantee / Credit Authorization',
  equipment_quote:           'Equipment Quote',
  ar_aging:                  'Accounts Receivable Aging',
  invoice_samples:           'Invoice Samples',
  po_documents:              'Purchase Orders / Customer Credit Info',
};

export type RequirementInput = { intake: Intake | null; step2: Step2Selection | null };

// Core rules extracted from your earlier engine & doc rules
export function buildRequirements({ intake, step2 }: RequirementInput): DocRequirement[] {
  const base: DocRequirement[] = [
    req('bank_statements_6m', true),
    req('tax_returns_3y',     true),
    req('financial_statements', true),
  ];

  const cat = step2?.categoryId;

  if (cat === 'equipment_financing') {
    base.push(req('equipment_quote', true));
  }
  if (cat === 'invoice_factoring') {
    base.push(req('ar_aging', true), req('invoice_samples', true));
  }
  if (cat === 'purchase_order_financing') {
    base.push(req('po_documents', true));
  }

  // Ownership / amount gating (simple, aligns with your rules)
  const needsPG = (intake?.amountRequested ?? 0) >= 25000; // tune threshold as you like
  if (needsPG) {
    base.push(req('personal_financial_statement', true), req('pg_authorization', true));
  }

  // Country-specific tweaks (example placeholders)
  // if (intake?.country === 'CA') { /* add/remove items if needed */ }

  return base;
}

function req(key: DocKey, required: boolean): DocRequirement {
  return { key, required, label: LABELS[key] };
}