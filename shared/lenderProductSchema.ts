import { z } from "zod";
import { SUPPORTED_DOCUMENT_TYPES, DocumentType } from "./documentTypes";

// Strict schema for validated lender products
export const LenderProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  lenderName: z.string(),
  geography: z.array(z.enum(["US", "CA"])),
  country: z.string().optional(), // Keep raw country field for filtering
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

// Raw API response schema - C-1: Fixed to match ACTUAL staff API response format
export const StaffAPIResponseSchema = z.object({
  success: z.boolean(),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(), // API returns 'name', not 'productName'
    lenderName: z.string(),
    category: z.string(),
    country: z.string().optional(), // Staff API now provides country field (US, CA, US/CA)
    geography: z.array(z.string()).optional(), // Staff API may not include geography
    amountMin: z.union([z.string(), z.number()]), // API returns amountMin directly
    amountMax: z.union([z.string(), z.number()]), // API returns amountMax directly
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
    "Accountant Prepared Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Accounts Receivable Aging Report",
    "Cash Flow Projections",
    "Personal Guarantee"
  ],
  "term_loan": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Accountant Prepared Financial Statements (P&L and Balance Sheet)",
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
    "Accountant Prepared Financial Statements (P&L and Balance Sheet)",
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
    "Accountant Prepared Financial Statements (P&L and Balance Sheet)",
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
    "Accountant Prepared Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Accounts Receivable Aging Report",
    "Inventory Reports",
    "Cash Flow Projections"
  ],
  "purchase_order_financing": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Accountant Prepared Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "Purchase Order Documentation",
    "Customer Credit Information",
    "Supplier Contracts"
  ],
  "asset_based_lending": [
    "Bank Statements (6 months)",
    "Business Tax Returns (2-3 years)",
    "Accountant Prepared Financial Statements (P&L and Balance Sheet)",
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
    "Accountant Prepared Financial Statements (P&L and Balance Sheet)",
    "Business License",
    "Articles of Incorporation",
    "SBA Form 1919",
    "Personal History Statement",
    "Resume and References"
  ]
};