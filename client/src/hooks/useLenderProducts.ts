import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

/**
 * ✅ ENABLED: Load lender products from local sync
 * Products are synced from staff app and stored locally
 */
export function useLenderProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/data/lenderProducts.json");
        const data = await res.json();
        setProducts(data);
        console.log(`✅ Loaded ${data.length} lender products from local sync`);
      } catch (error) {
        console.error("❌ Failed to load lender products:", error);
        setProducts([]);
      }
    }
    fetchProducts();
  }, []);

  return products;
}

/**
 * ✅ ENABLED: React Query version for consistent API
 */
export const useLenderProductsQuery = () => {
  return useQuery({
    queryKey: ["lender-products-local"],
    queryFn: async () => {
      const res = await fetch("/data/lenderProducts.json");
      if (!res.ok) {
        throw new Error("Failed to load local lender products");
      }
      const data = await res.json();
      console.log(`✅ Loaded ${data.length} lender products from local sync`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * ✅ ENABLED: Get products by category
 */
export function useLenderProductsByCategory(category?: string) {
  const products = useLenderProducts();
  
  if (!category) return products;
  
  return products.filter(product => 
    product.category?.toLowerCase() === category.toLowerCase() ||
    product.productCategory?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * ✅ ENABLED: Get unique categories
 */
export function useProductCategories() {
  const products = useLenderProducts();
  
  const categories = [...new Set(
    products.map(p => p.category || p.productCategory).filter(Boolean)
  )];
  
  return categories;
}

/**
 * ✅ ENABLED: Find product by ID
 */
export function useLenderProduct(id?: string) {
  const products = useLenderProducts();
  
  return products.find(p => p.id === id || p.productId === id) || null;
}

// Keep disabled functions for backward compatibility
export function useLenderProductsLive() {
  // No-op - using local sync instead
  return;
}

// Export types for external use (will be defined by the synced data structure)
export type LenderProduct = any;
export type LenderProductsResponse = { products: LenderProduct[] };
export type LenderProductFilters = Record<string, any>;