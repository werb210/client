import { z } from 'zod';
import { pgTable, text, integer, decimal, jsonb, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

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