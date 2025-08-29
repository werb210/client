import { Product, Category } from '../products/normalize';

export type Owner = { name: string; ownershipPct: number; hasSSN?: boolean };
export type BusinessStructure = 'llc'|'corporation'|'partnership'|'sole_prop';

export type Step5Input = {
  country: 'US'|'CA'|string;
  fundingAmount: number;
  productPreference: 'capital'|'equipment'|'both';
  structure: BusinessStructure;
  owners: Owner[];
  hasSSN?: boolean;             // for sole prop or general identity rule
  hasAR?: boolean;              // AR present
  purpose?: 'inventory'|'equipment'|'general'|string;
};

export type DocKey =
  | 'bank_statements_6m' | 'tax_returns_3y' | 'financials_pl_bs' | 'business_license' | 'articles_of_incorporation'
  | 'operating_agreement' | 'articles_of_organization' | 'member_resolution'
  | 'corporate_bylaws' | 'board_resolution' | 'stock_certificates'
  | 'partnership_agreement' | 'partnership_registration'
  | 'dba_filing' | 'personal_financial_statement'
  | 'personal_guarantee' | 'credit_report_auth'
  | 'driver_license' | 'ssn_card_copy' | 'government_id' | 'proof_of_identity'
  | 'cash_flow_statement'
  | 'equipment_quote'
  | 'ar_aging' | 'invoice_samples'
  | 'purchase_orders' | 'customer_credit_info'
  | 'asset_valuation'
  | 'void_cheque'; // optional common add-on

export type RequiredDoc = { key: DocKey; name: string; required: boolean; category?: string };

const CORE_ALWAYS: RequiredDoc[] = [
  { key:'bank_statements_6m', name:'Bank Statements (6 months)', required:true },
  { key:'tax_returns_3y',     name:'Business Tax Returns (3 years)', required:true },
  { key:'financials_pl_bs',   name:'Financial Statements (P&L and Balance Sheet)', required:true },
  { key:'business_license',   name:'Business License', required:true },
  { key:'articles_of_incorporation', name:'Articles of Incorporation', required:true },
];

// Category fallbacks
const CATEGORY_DOCS: Record<Category, RequiredDoc[]> = {
  working_capital: [
    { key:'bank_statements_6m', name:'Bank Statements (6 months)', required:true },
    { key:'financials_pl_bs',   name:'Financial Statements', required:true },
    { key:'tax_returns_3y',     name:'Business Tax Returns (3 years)', required:true },
  ],
  term_loan: [
    { key:'bank_statements_6m', name:'Bank Statements (6 months)', required:true },
    { key:'tax_returns_3y',     name:'Business Tax Returns (3 years)', required:true },
    { key:'financials_pl_bs',   name:'Financial Statements', required:true },
    { key:'cash_flow_statement',name:'Cash Flow Statement', required:true },
  ],
  line_of_credit: [
    { key:'bank_statements_6m', name:'Bank Statements (6 months)', required:true },
    { key:'financials_pl_bs',   name:'Financial Statements', required:true },
    { key:'tax_returns_3y',     name:'Business Tax Returns (3 years)', required:true },
  ],
  equipment_financing: [
    { key:'equipment_quote',    name:'Equipment Quote', required:true },
    { key:'bank_statements_6m', name:'Bank Statements (6 months)', required:true },
    { key:'tax_returns_3y',     name:'Business Tax Returns (3 years)', required:true },
  ],
  invoice_factoring: [
    { key:'ar_aging',           name:'Accounts Receivable Aging', required:true },
    { key:'bank_statements_6m', name:'Bank Statements (6 months)', required:true },
    { key:'invoice_samples',    name:'Invoice Samples', required:true },
  ],
  purchase_order_financing: [
    { key:'purchase_orders',    name:'Purchase Orders', required:true },
    { key:'bank_statements_6m', name:'Bank Statements (6 months)', required:true },
    { key:'customer_credit_info', name:'Customer Credit Information', required:true },
  ],
  asset_based_lending: [
    { key:'asset_valuation',    name:'Asset Valuation', required:true },
    { key:'bank_statements_6m', name:'Bank Statements (6 months)', required:true },
    { key:'financials_pl_bs',   name:'Financial Statements', required:true },
  ],
  sba_loan: [
    // Can layer SBA specifics later; core docs already cover baseline
    { key:'bank_statements_6m', name:'Bank Statements (6 months)', required:true },
    { key:'tax_returns_3y',     name:'Business Tax Returns (3 years)', required:true },
    { key:'financials_pl_bs',   name:'Financial Statements', required:true },
  ],
};

// Business structure docs
function structureDocs(structure: BusinessStructure): RequiredDoc[] {
  switch (structure) {
    case 'llc':
      return [
        { key:'operating_agreement', name:'Operating Agreement', required:true },
        { key:'articles_of_organization', name:'Articles of Organization', required:true },
        { key:'member_resolution', name:'Member Resolution', required:true },
      ];
    case 'corporation':
      return [
        { key:'corporate_bylaws', name:'Corporate Bylaws', required:true },
        { key:'articles_of_incorporation', name:'Articles of Incorporation', required:true },
        { key:'board_resolution', name:'Board Resolution', required:true },
        { key:'stock_certificates', name:'Stock Certificates', required:false },
      ];
    case 'partnership':
      return [
        { key:'partnership_agreement', name:'Partnership Agreement', required:true },
        { key:'partnership_registration', name:'Partnership Registration', required:true },
      ];
    case 'sole_prop':
      return [
        { key:'dba_filing', name:'DBA Filing', required:false },
        { key:'personal_financial_statement', name:'Personal Financial Statement', required:true },
      ];
    default:
      return [];
  }
}

// Ownership & identity docs
function ownershipDocs(owners: {ownershipPct:number}[]): RequiredDoc[] {
  const has50 = owners.some(o => (o.ownershipPct ?? 0) >= 50);
  return has50
    ? [
        { key:'personal_guarantee', name:'Personal Guarantee', required:true },
        { key:'personal_financial_statement', name:'Personal Financial Statement', required:true },
        { key:'credit_report_auth', name:'Personal Credit Report Authorization', required:true },
      ]
    : [];
}

function identityDocs(owners: Owner[], hasSSN?: boolean): RequiredDoc[] {
  // If the business/owners have SSN, require DL + SSN card; otherwise govt ID + proof
  const anySSN = hasSSN || owners.some(o => o.hasSSN);
  return anySSN
    ? [
        { key:'driver_license',  name:'Driver License', required:true },
        { key:'ssn_card_copy',   name:'Social Security Card Copy', required:true },
      ]
    : [
        { key:'government_id',   name:'Government ID', required:true },
        { key:'proof_of_identity', name:'Proof of Identity', required:true },
      ];
}

function dedupe(docs: RequiredDoc[]): RequiredDoc[] {
  const seen = new Map<string, RequiredDoc>();
  for (const d of docs) {
    const prev = seen.get(d.key);
    // If any source says "required", keep required=true
    seen.set(d.key, prev ? { ...prev, required: prev.required || d.required } : d);
  }
  return [...seen.values()];
}

export function eligibleProductsForDocs(products: Product[], input: { country:string; fundingAmount:number; productPreference:'capital'|'equipment'|'both' }): Product[] {
  const allowedMap = {
    capital: ['term_loan','working_capital','line_of_credit'],
    equipment: ['equipment_financing'],
    both: ['term_loan','working_capital','line_of_credit','equipment_financing'],
  } as const;
  const allowed = allowedMap[input.productPreference] as readonly string[];

  return products.filter(p =>
    p.country === input.country &&
    input.fundingAmount >= p.minAmount &&
    input.fundingAmount <= p.maxAmount &&
    allowed.includes(p.category)
  );
}

export function computeRequiredDocs(input: Step5Input, eligible: Product[]): RequiredDoc[] {
  const base: RequiredDoc[] = [...CORE_ALWAYS];

  // Union of category fallbacks across eligible products
  for (const p of eligible) {
    const add = CATEGORY_DOCS[p.category] ?? [];
    base.push(...add);
  }

  // Business structure, ownership, identity
  base.push(...structureDocs(input.structure));
  base.push(...ownershipDocs(input.owners));
  base.push(...identityDocs(input.owners, input.hasSSN));

  // Special inclusions from Step 2 rules (mirror business intent)
  if (eligible.some(p => p.category === 'invoice_factoring') && input.hasAR) {
    base.push({ key:'ar_aging', name:'Accounts Receivable Aging', required:true });
  }
  if (eligible.some(p => p.category === 'purchase_order_financing') && input.purpose === 'inventory') {
    base.push({ key:'purchase_orders', name:'Purchase Orders', required:true });
    base.push({ key:'customer_credit_info', name:'Customer Credit Information', required:false });
  }

  return dedupe(base);
}