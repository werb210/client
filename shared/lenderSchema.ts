import { z } from 'zod';
import { pgTable, text, integer, decimal, jsonb, timestamp, uuid, boolean, varchar, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { sql } from 'drizzle-orm';

// Lender Products Table Schema (matching existing database structure)
export const lenderProducts = pgTable('lender_products', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'working_capital', 'term_loan', 'line_of_credit', 'equipment_financing', etc.
  description: text('description'),
  min_amount: decimal('min_amount', { precision: 12, scale: 2 }),
  max_amount: decimal('max_amount', { precision: 12, scale: 2 }),
  interest_rate_min: decimal('interest_rate_min', { precision: 5, scale: 4 }),
  interest_rate_max: decimal('interest_rate_max', { precision: 5, scale: 4 }),
  term_min: integer('term_min'),
  term_max: integer('term_max'),
  requirements: jsonb('requirements').$type<string[]>(),
  video_url: text('video_url'),
  active: boolean('active').default(true),
});

// Applications Table Schema (matching existing database structure)
export const applications = pgTable('applications', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar('user_id').notNull(),
  status: varchar('status').notNull(),
  current_step: integer('current_step').notNull(),
  business_legal_name: varchar('business_legal_name'),
  industry: varchar('industry'),
  headquarters: varchar('headquarters'),
  annual_revenue: varchar('annual_revenue'),
  use_of_funds: text('use_of_funds'),
  requested_amount: decimal('requested_amount', { precision: 12, scale: 2 }),
  selected_product: varchar('selected_product'),
  applicant_name: varchar('applicant_name'),
  applicant_email: varchar('applicant_email'),
  applicant_phone: varchar('applicant_phone'),
  terms_accepted: boolean('terms_accepted'),
  signature_completed: boolean('signature_completed'),
  signed_document_url: varchar('signed_document_url'),
  form_data: jsonb('form_data'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  product_category: text('product_category'),
  stage: text('stage'),
  amount_requested: text('amount_requested'),
});

// Zod schemas for validation
export const insertLenderProductSchema = createInsertSchema(lenderProducts, {
  min_amount: z.coerce.number().positive().optional(),
  max_amount: z.coerce.number().positive().optional(),
  interest_rate_min: z.coerce.number().min(0).max(1).optional(),
  interest_rate_max: z.coerce.number().min(0).max(1).optional(),
  term_min: z.coerce.number().int().positive().optional(),
  term_max: z.coerce.number().int().positive().optional(),
  requirements: z.array(z.string()).optional(),
});

export const selectLenderProductSchema = createSelectSchema(lenderProducts);

export const insertApplicationSchema = createInsertSchema(applications, {
  requested_amount: z.coerce.number().positive().optional(),
  current_step: z.coerce.number().int().min(1).max(7).default(1),
  status: z.string().default('draft'),
  form_data: z.record(z.any()).optional(),
});

export const selectApplicationSchema = createSelectSchema(applications);

// TypeScript types
export type LenderProduct = typeof lenderProducts.$inferSelect;
export type InsertLenderProduct = typeof lenderProducts.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// API response types
export interface LenderProductsResponse {
  products: LenderProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface LenderProductFilters {
  type?: string;
  min_amount?: number;
  max_amount?: number;
  active?: boolean;
}

// Normalized interface for frontend compatibility
export interface NormalizedLenderProduct {
  id: string;
  product_name: string;
  lender_name: string;
  product_type: string;
  geography: string[];
  min_amount: number;
  max_amount: number;
  min_revenue?: number;
  industries?: string[];
  video_url?: string;
  description?: string;
}