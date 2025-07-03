import { z } from "zod";

// Strict schema for validated lender products
export const LenderProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  lenderName: z.string(),
  geography: z.array(z.enum(["US", "CA"])),
  category: z.enum([
    "line_of_credit",
    "term_loan", 
    "equipment_financing",
    "invoice_factoring",
    "working_capital",
    "purchase_order_financing",
    "asset_based_lending",
    "sba_loan"
  ]),
  minAmount: z.number().int().nonnegative(),
  maxAmount: z.number().int().positive(),
  minRevenue: z.number().int().nonnegative(),
  interestRateMin: z.number().optional(),
  interestRateMax: z.number().optional(),
  termMin: z.number().int().positive().optional(),
  termMax: z.number().int().positive().optional(),
  docRequirements: z.array(z.string()),
  description: z.string().optional(),
  industries: z.array(z.string()).optional(),
});

export type LenderProduct = z.infer<typeof LenderProductSchema>;

// Raw API response schema - Updated to match actual staff API response format
export const StaffAPIResponseSchema = z.object({
  success: z.boolean(),
  products: z.array(z.object({
    id: z.string(),
    productName: z.string(),
    lenderName: z.string(),
    category: z.string(),
    geography: z.array(z.string()).optional(), // Staff API may not include geography
    amountRange: z.object({
      min: z.union([z.string(), z.number()]), // Staff API sends numbers, not strings
      max: z.union([z.string(), z.number()]), // Staff API sends numbers, not strings
    }),
    requirements: z.object({
      minMonthlyRevenue: z.union([z.string(), z.number()]).optional(), // Staff API sends numbers
      industries: z.array(z.string()).nullable().optional(),
    }).optional(),
    description: z.string().optional(),
  })),
  count: z.number(),
});

export type StaffAPIResponse = z.infer<typeof StaffAPIResponseSchema>;

// Document requirements mapping
export const DOCUMENT_REQUIREMENTS_MAP: Record<string, string[]> = {
  "line_of_credit": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Accounts Receivable Aging Report",
    "Cash Flow Projections",
    "Personal Guarantee"
  ],
  "term_loan": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Business Plan with Use of Funds",
    "Personal Financial Statement",
    "Personal Tax Returns (2 years)",
    "Collateral Documentation"
  ],
  "equipment_financing": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Equipment Quote or Invoice",
    "Equipment Specifications",
    "Insurance Documentation",
    "UCC Filing Documents"
  ],
  "invoice_factoring": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Invoice Samples (90 days)",
    "Customer Credit Reports",
    "Accounts Receivable Aging Report",
    "Customer Payment History"
  ],
  "working_capital": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Accounts Receivable Aging Report",
    "Inventory Reports",
    "Cash Flow Projections"
  ],
  "purchase_order_financing": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Purchase Order Documentation",
    "Customer Credit Information",
    "Supplier Contracts"
  ],
  "asset_based_lending": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Asset Appraisals",
    "Insurance Documentation",
    "UCC Search Results",
    "Collateral Documentation"
  ],
  "sba_loan": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "SBA Form 1919",
    "Personal History Statement",
    "Resume and References"
  ]
};