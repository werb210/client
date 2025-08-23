import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";

// Local API URL - connect to local database endpoint  
const API_URL = import.meta.env.VITE_API_URL || "";

// Product schema matching the database structure
const LenderProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  min_amount: z.string().or(z.number()),
  max_amount: z.string().or(z.number()),
  interest_rate_min: z.string().or(z.number()).nullable(),
  interest_rate_max: z.string().or(z.number()).nullable(),
  term_min: z.number().nullable(),
  term_max: z.number().nullable(),
  requirements: z.array(z.string()).nullable(),
  video_url: z.string().nullable(),
  active: z.boolean(),
});

const LenderProductsResponseSchema = z.object({
  success: z.boolean(),
  products: z.array(LenderProductSchema),
  count: z.number(),
});

export type LenderProduct = z.infer<typeof LenderProductSchema>;
export type LenderProductsResponse = z.infer<typeof LenderProductsResponseSchema>;

/**
 * ✅ BLOCK 2: Direct staff API connection without cache fallback
 * Fetches live lender products from staff backend
 */
export const useLenderProducts = () => {
  return useQuery({
    queryKey: ["lenderProducts"],
    queryFn: async (): Promise<LenderProduct[]> => {
      console.log(`🔄 Fetching lender products from local database API: /api/lender-products`);
      
      const { data } = await axios.get(`/api/lender-products`);
      
      if (!data.success) {
        throw new Error("Failed to fetch lender products from staff API");
      }
      
      console.log(`✅ Loaded ${data.count} lender products from local database`);
      return data.products;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * ✅ Get products by category/type
 */
export function useLenderProductsByCategory(category?: string) {
  const { data: products = [], ...query } = useLenderProducts();
  
  const filteredProducts = category 
    ? products.filter((product: LenderProduct) => 
        product.type.toLowerCase() === category.toLowerCase()
      )
    : products;
    
  return { ...query, data: filteredProducts };
}

/**
 * ✅ Get unique product types/categories
 */
export function useProductCategories() {
  const { data: products = [], ...query } = useLenderProducts();
  
  const categories = [...new Set(
    products.map((p: LenderProduct) => p.type).filter(Boolean)
  )];
  
  return { ...query, data: categories };
}

/**
 * ✅ Find product by ID
 */
export function useLenderProduct(id?: number | string) {
  const { data: products = [], ...query } = useLenderProducts();
  
  const productId = typeof id === 'string' ? parseInt(id) : id;
  const product = products.find((p: LenderProduct) => p.id === productId) || null;
  
  return { ...query, data: product };
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