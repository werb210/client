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

// Retry Queue Table for V1 migration
export const retryQueue = pgTable('retry_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  endpoint: text('endpoint').notNull(),
  payload: jsonb('payload'),
  try_count: integer('try_count').default(0),
  max_retries: integer('max_retries').default(5),
  next_retry_at: timestamp('next_retry_at').defaultNow(),
  last_error: text('last_error'),
  created_at: timestamp('created_at').defaultNow(),
});

// Transmission Logs Table for V1 migration  
export const transmissionLogs = pgTable('transmission_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  route: text('route'),
  status: integer('status'),
  payload: jsonb('payload'),
  response_body: text('response_body'),
  error_message: text('error_message'),
  duration_ms: integer('duration_ms'),
  created_at: timestamp('created_at').defaultNow(),
});

// Audit Logs Table for V1 migration
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id'),
  action: text('action'),
  resource_type: text('resource_type'),
  resource_id: text('resource_id'),
  meta: jsonb('meta'),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
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