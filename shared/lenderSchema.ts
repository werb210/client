import { z } from 'zod';
import { pgTable, text, integer, real, timestamp, boolean, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { sql } from 'drizzle-orm';

// ✅ EXISTING DATABASE SCHEMA (13 columns) - SAFE COMPATIBILITY
export const lenderProducts = pgTable('lender_products', {
  id: serial('id').primaryKey(), // Keep existing serial ID
  name: text('name').notNull(),
  type: text('type').notNull(), // 'working_capital', 'term_loan', 'line_of_credit', 'equipment_financing', etc.
  description: text('description'),
  min_amount: text('min_amount'), // Keep as text to match existing
  max_amount: text('max_amount'), // Keep as text to match existing
  interest_rate_min: text('interest_rate_min'), // Keep as text to match existing
  interest_rate_max: text('interest_rate_max'), // Keep as text to match existing
  term_min: integer('term_min'),
  term_max: integer('term_max'),
  requirements: text('requirements').array(), // Keep as text array
  video_url: text('video_url'),
  active: boolean('active').default(true),
});

// ✅ 22-FIELD CLIENT INTERFACE - TRANSFORMATION TARGET
export interface ClientLenderProduct {
  id: string;
  lenderName: string;
  productCategory: string; // SBA, Equipment, Working Capital, Term Loan, etc.
  productName: string;
  minimumLendingAmount: number;
  maximumLendingAmount: number;
  interestRateMinimum: number; // stored as decimal (e.g., 0.05 for 5%)
  interestRateMaximum: number;
  countryOffered: string; // 'United States' or 'Canada'
  rateType: string; // 'Fixed' or 'Floating'
  rateFrequency: string; // 'Monthly' or 'Annually'
  index?: string; // Prime, SOFR, etc. (optional, mainly for floating rates)
  termMinimum: number; // in months
  termMaximum: number; // in months
  minimumAverageMonthlyRevenue?: number; // minimum monthly revenue requirement
  minimumCreditScore?: number; // minimum credit score requirement
  documentsRequired: string[]; // array of document types
  description?: string; // optional product description
  externalId?: string; // for tracking products from external APIs, must be unique when present
  isActive: boolean;
  createdBy: number; // references users.id
  createdAt: string;
  updatedAt: string;
}

// ✅ TRANSFORMATION FUNCTION: 13-field DB → 22-field Client Interface
export function transformToClientSchema(dbProduct: any): ClientLenderProduct {
  return {
    id: dbProduct.id.toString(),
    lenderName: "Boreal Financial", // Default lender name
    productCategory: transformTypeToCategory(dbProduct.type),
    productName: dbProduct.name,
    minimumLendingAmount: parseFloat(dbProduct.min_amount) || 0,
    maximumLendingAmount: parseFloat(dbProduct.max_amount) || 0,
    interestRateMinimum: parseFloat(dbProduct.interest_rate_min) || 0.05,
    interestRateMaximum: parseFloat(dbProduct.interest_rate_max) || 0.25,
    countryOffered: "United States", // Default country
    rateType: "Fixed", // Default rate type
    rateFrequency: "Monthly", // Default frequency
    index: undefined, // Optional field
    termMinimum: dbProduct.term_min || 12,
    termMaximum: dbProduct.term_max || 60,
    minimumAverageMonthlyRevenue: undefined, // Optional
    minimumCreditScore: undefined, // Optional
    documentsRequired: dbProduct.requirements || [],
    description: dbProduct.description,
    externalId: undefined, // Optional
    isActive: dbProduct.active !== false,
    createdBy: 1, // Default system user
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ✅ TYPE MAPPING: Old type → New category
function transformTypeToCategory(type: string): string {
  const typeMap: Record<string, string> = {
    'working_capital': 'Working Capital',
    'term_loan': 'Term Loan',
    'line_of_credit': 'Line of Credit',
    'equipment_financing': 'Equipment Financing',
    'sba_loan': 'SBA Loan',
    'factoring': 'Invoice Factoring',
    'merchant_cash_advance': 'Merchant Cash Advance',
  };
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ✅ COMPATIBLE INSERT/SELECT SCHEMAS (13-field DB)
export const insertLenderProductSchema = createInsertSchema(lenderProducts, {
  min_amount: z.string().optional(),
  max_amount: z.string().optional(),
  interest_rate_min: z.string().optional(),
  interest_rate_max: z.string().optional(),
  term_min: z.number().int().positive().optional(),
  term_max: z.number().int().positive().optional(),
  requirements: z.array(z.string()).optional(),
});

export const selectLenderProductSchema = createSelectSchema(lenderProducts);

// ✅ DATABASE TYPES (13-field)
export type DatabaseLenderProduct = typeof lenderProducts.$inferSelect;
export type InsertLenderProduct = typeof lenderProducts.$inferInsert;

// ✅ CLIENT TYPES (22-field interface)
export type LenderProduct = ClientLenderProduct;

// ✅ API RESPONSE TYPES FOR CLIENT
export interface LenderProductsResponse {
  success: boolean;
  products: ClientLenderProduct[];
  count: number;
  source: string;
}

export interface LenderProductFilters {
  type?: string; // Use existing DB field names
  min_amount?: number;
  max_amount?: number;
  active?: boolean;
}