import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// ✅ COMPREHENSIVE 22-FIELD LENDER PRODUCT SCHEMA
const LenderProductSchema = z.object({
  id: z.string(),
  lenderName: z.string(),
  productCategory: z.string(), // SBA, Equipment, Working Capital, Term Loan, etc.
  productName: z.string(),
  minimumLendingAmount: z.number(),
  maximumLendingAmount: z.number(),
  interestRateMinimum: z.number(), // stored as decimal (e.g., 0.05 for 5%)
  interestRateMaximum: z.number(),
  countryOffered: z.string(), // 'United States' or 'Canada'
  rateType: z.string(), // 'Fixed' or 'Floating'
  rateFrequency: z.string(), // 'Monthly' or 'Annually'
  index: z.string().optional(), // Prime, SOFR, etc.
  termMinimum: z.number(), // in months
  termMaximum: z.number(), // in months
  minimumAverageMonthlyRevenue: z.number().optional(),
  minimumCreditScore: z.number().optional(),
  documentsRequired: z.array(z.string()),
  description: z.string().optional(),
  externalId: z.string().optional(),
  isActive: z.boolean(),
  createdBy: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const LenderProductsResponseSchema = z.object({
  success: z.boolean(),
  products: z.array(LenderProductSchema),
  count: z.number(),
  source: z.string().optional(),
});

export type LenderProduct = z.infer<typeof LenderProductSchema>;
export type LenderProductsResponse = z.infer<typeof LenderProductsResponseSchema>;

/**
 * ✅ STEP 1: React Query Hook with 22-Field Schema
 * Fetches comprehensive lender products with full schema support
 */
export function useLenderProducts() {
  return useQuery({
    queryKey: ["lenderProducts"],
    queryFn: async (): Promise<LenderProduct[]> => {
      console.log('🔄 Fetching lender products with 22-field schema...');
      
      const res = await fetch(`/api/catalog/export-products?includeInactive=1`);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error("Failed to fetch lender products");
      }
      
      // Transform existing products to 22-field schema with defaults
      const transformedProducts: LenderProduct[] = data.products.map((product: any) => ({
        id: product.id.toString(),
        lenderName: "Boreal Financial", // Default for existing products
        productCategory: product.category || product.productCategory || "Unknown", // Map to normalized category
        productName: product.name,
        minimumLendingAmount: parseFloat(product.min_amount) || 0,
        maximumLendingAmount: parseFloat(product.max_amount) || 0,
        interestRateMinimum: parseFloat(product.interest_rate_min) || 0.05,
        interestRateMaximum: parseFloat(product.interest_rate_max) || 0.25,
        countryOffered: "United States", // Default country
        rateType: "Fixed", // Default rate type
        rateFrequency: "Monthly", // Default frequency
        index: undefined, // Optional field
        termMinimum: product.term_min || 12,
        termMaximum: product.term_max || 60,
        minimumAverageMonthlyRevenue: undefined, // Optional
        minimumCreditScore: undefined, // Optional
        documentsRequired: product.requirements || [],
        description: product.description,
        externalId: undefined, // Optional
        isActive: product.active !== false,
        createdBy: 1, // Default system user
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      console.log(`✅ Loaded ${transformedProducts.length} products with 22-field schema`);
      return transformedProducts;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * ✅ STEP 2: Enhanced filtering with interest rates and amounts
 */
export function useLenderProductsByCategory(category?: string) {
  const { data: products = [], ...query } = useLenderProducts();
  
  const filteredProducts = category 
    ? products.filter((product: LenderProduct) => 
        product.productCategory.toLowerCase() === category.toLowerCase()
      )
    : products;
    
  return { ...query, data: filteredProducts };
}

/**
 * ✅ STEP 2: Always surface LOC products when within range
 */
export function useRecommendedProducts(amount?: number, creditScore?: number) {
  const { data: products = [], ...query } = useLenderProducts();
  
  if (!amount) return { ...query, data: products };
  
  const recommended = products.filter((product: LenderProduct) => {
    const withinAmount = amount >= product.minimumLendingAmount && amount <= product.maximumLendingAmount;
    const withinCredit = !product.minimumCreditScore || !creditScore || creditScore >= product.minimumCreditScore;
    
    // Always include Line of Credit products when within range
    const isLOC = product.productCategory.toLowerCase().includes('credit') || 
                  product.productCategory.toLowerCase().includes('line');
    
    return withinAmount && withinCredit && (isLOC || true);
  }).sort((a, b) => {
    // Prioritize LOC products
    const aIsLOC = a.productCategory.toLowerCase().includes('credit');
    const bIsLOC = b.productCategory.toLowerCase().includes('credit');
    
    if (aIsLOC && !bIsLOC) return -1;
    if (!aIsLOC && bIsLOC) return 1;
    
    // Then sort by interest rate
    return a.interestRateMinimum - b.interestRateMinimum;
  });
    
  return { ...query, data: recommended };
}

/**
 * ✅ Get unique product categories from 22-field schema
 */
export function useProductCategories() {
  const { data: products = [], ...query } = useLenderProducts();
  
  const categories = [...new Set(
    products.map((p: LenderProduct) => p.productCategory).filter(Boolean)
  )];
  
  return { ...query, data: categories };
}

/**
 * ✅ Find product by ID with 22-field schema
 */
export function useLenderProduct(id?: string) {
  const { data: products = [], ...query } = useLenderProducts();
  
  const product = products.find((p: LenderProduct) => p.id === id) || null;
  
  return { ...query, data: product };
}

/**
 * ✅ STEP 3: Dynamic document requirements
 */
export function useProductDocuments(productId?: string) {
  const { data: product, ...query } = useLenderProduct(productId);
  
  return { 
    ...query, 
    data: product?.documentsRequired || [],
    isLoading: query.isLoading
  };
}

// Legacy compatibility - return array directly for older components
export function useLenderProductsArray(): LenderProduct[] {
  const { data } = useLenderProducts();
  return data || [];
}

export function useProductCategoriesArray(): string[] {
  const { data } = useProductCategories();
  return data || [];
}