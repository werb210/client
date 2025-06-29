import { z } from 'zod';
import { pgTable, text, integer, decimal, jsonb, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Lender Products Table Schema
export const lenderProducts = pgTable('lender_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_name: text('product_name').notNull(),
  lender_name: text('lender_name').notNull(),
  product_type: text('product_type').notNull(), // 'working_capital', 'term_loan', 'line_of_credit', 'equipment_financing', etc.
  geography: jsonb('geography').$type<string[]>().notNull(), // ['US', 'CA'] or specific states
  min_amount: decimal('min_amount', { precision: 12, scale: 2 }).notNull(),
  max_amount: decimal('max_amount', { precision: 12, scale: 2 }).notNull(),
  min_revenue: decimal('min_revenue', { precision: 12, scale: 2 }),
  industries: jsonb('industries').$type<string[]>(), // Array of industry codes/names
  interest_rate_min: decimal('interest_rate_min', { precision: 5, scale: 4 }),
  interest_rate_max: decimal('interest_rate_max', { precision: 5, scale: 4 }),
  term_months_min: integer('term_months_min'),
  term_months_max: integer('term_months_max'),
  description: text('description'),
  video_url: text('video_url'),
  application_url: text('application_url'),
  requirements: jsonb('requirements').$type<string[]>(),
  features: jsonb('features').$type<string[]>(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Zod schemas for validation
export const insertLenderProductSchema = createInsertSchema(lenderProducts, {
  min_amount: z.coerce.number().positive(),
  max_amount: z.coerce.number().positive(),
  min_revenue: z.coerce.number().positive().optional(),
  interest_rate_min: z.coerce.number().min(0).max(1).optional(),
  interest_rate_max: z.coerce.number().min(0).max(1).optional(),
  term_months_min: z.coerce.number().int().positive().optional(),
  term_months_max: z.coerce.number().int().positive().optional(),
  geography: z.array(z.string()).min(1),
  industries: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

export const selectLenderProductSchema = createSelectSchema(lenderProducts);

// TypeScript types
export type LenderProduct = typeof lenderProducts.$inferSelect;
export type InsertLenderProduct = typeof lenderProducts.$inferInsert;

// API response types
export interface LenderProductsResponse {
  products: LenderProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface LenderProductFilters {
  geography?: string[];
  product_type?: string;
  min_amount?: number;
  max_amount?: number;
  industries?: string[];
  lender_name?: string;
  is_active?: boolean;
}