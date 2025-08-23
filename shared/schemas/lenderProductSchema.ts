import { z } from "zod";

/**
 * ✅ SHARED: Lender Product Schema for Client-Staff Synchronization
 * This schema defines the expected structure for lender products
 * and ensures consistency between client validation and staff API
 */
export const LenderProductSchema = z.object({
  id: z.string(),
  lenderName: z.string(),
  productName: z.string(), 
  category: z.string(),
  country: z.string(),
  minAmount: z.number(),
  maxAmount: z.number(),
  interestRate: z.number(),
  termLength: z.string(),
  documentsRequired: z.array(z.string()),
  description: z.string(),
  updatedAt: z.string().datetime()
});

/**
 * Response schema for the API endpoint
 */
export const LenderProductsResponseSchema = z.object({
  ok: z.boolean(),
  count: z.number(),
  products: z.array(LenderProductSchema),
});

// Type exports for TypeScript usage
export type LenderProduct = z.infer<typeof LenderProductSchema>;
export type LenderProductsResponse = z.infer<typeof LenderProductsResponseSchema>;

/**
 * Generate JSON Schema for staff app form generation
 */
export function getLenderProductJsonSchema() {
  // Convert Zod schema to JSON Schema format
  return {
    type: "object",
    properties: {
      id: { type: "string", description: "Unique product identifier" },
      lenderName: { type: "string", description: "Name of the lender institution" },
      productName: { type: "string", description: "Name of the financial product" },
      category: { type: "string", description: "Product category (e.g., equipment, working_capital)" },
      country: { type: "string", description: "Country where product is available" },
      minAmount: { type: "number", description: "Minimum loan amount" },
      maxAmount: { type: "number", description: "Maximum loan amount" },
      interestRate: { type: "number", description: "Interest rate (as decimal, e.g., 0.05 for 5%)" },
      termLength: { type: "string", description: "Loan term (e.g., '12 months', '2 years')" },
      documentsRequired: { 
        type: "array", 
        items: { type: "string" }, 
        description: "List of required documents" 
      },
      description: { type: "string", description: "Product description" },
      updatedAt: { type: "string", format: "date-time", description: "Last update timestamp" }
    },
    required: [
      "id", "lenderName", "productName", "category", "country",
      "minAmount", "maxAmount", "interestRate", "termLength", 
      "documentsRequired", "description", "updatedAt"
    ]
  };
}