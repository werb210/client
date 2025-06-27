import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number"),
  is2FAEnabled: boolean("is_2fa_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2FA codes table for SMS verification
export const twoFactorCodes = pgTable("two_factor_codes", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  phoneNumber: varchar("phone_number").notNull(),
  codeHash: varchar("code_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").default(0),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("draft"), // draft, submitted, under_review, approved, rejected
  currentStep: integer("current_step").notNull().default(1),
  
  // Business information
  businessLegalName: varchar("business_legal_name"),
  industry: varchar("industry"),
  headquarters: varchar("headquarters"),
  annualRevenue: varchar("annual_revenue"),
  useOfFunds: text("use_of_funds"),
  requestedAmount: decimal("requested_amount", { precision: 12, scale: 2 }),
  
  // Selected lender product
  selectedProduct: varchar("selected_product"), // term_loan, line_of_credit, invoice_factoring
  
  // Personal details
  applicantName: varchar("applicant_name"),
  applicantEmail: varchar("applicant_email"),
  applicantPhone: varchar("applicant_phone"),
  
  // Agreement and signature
  termsAccepted: boolean("terms_accepted").default(false),
  signatureCompleted: boolean("signature_completed").default(false),
  signedDocumentUrl: varchar("signed_document_url"),
  
  // Additional data (flexible JSON field for step-specific data)
  formData: jsonb("form_data"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document uploads table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.id),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: varchar("file_type").notNull(),
  fileUrl: varchar("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Lender products table for recommendations
export const lenderProducts = pgTable("lender_products", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // term_loan, line_of_credit, invoice_factoring
  description: text("description"),
  minAmount: decimal("min_amount", { precision: 12, scale: 2 }),
  maxAmount: decimal("max_amount", { precision: 12, scale: 2 }),
  interestRateMin: decimal("interest_rate_min", { precision: 5, scale: 2 }),
  interestRateMax: decimal("interest_rate_max", { precision: 5, scale: 2 }),
  termMin: integer("term_min"), // in months
  termMax: integer("term_max"), // in months
  requirements: jsonb("requirements"),
  videoUrl: varchar("video_url"),
  active: boolean("active").default(true),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type LenderProduct = typeof lenderProducts.$inferSelect;

// Zod schemas for validation
export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateApplicationSchema = insertApplicationSchema.partial();

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});
