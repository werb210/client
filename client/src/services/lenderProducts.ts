/**
 * Client-side lender products service
 * Loads products from local sync data
 */

/**
 * ✅ ENHANCED: Use validated fetchLenderProducts from hooks
 */
export async function fetchLenderProducts() {
  // Import the enhanced function with schema validation
  const { fetchLenderProducts: validatedFetch } = await import('../hooks/useLenderProducts');
  return await validatedFetch();
}

/**
 * ✅ ENABLED: Get product categories
 */
export async function getProductCategories() {
  const products = await fetchLenderProducts();
  const categories = [...new Set(
    products.map(p => p.category || p.productCategory).filter(Boolean)
  )];
  return categories;
}

/**
 * ✅ ENABLED: Find product by ID
 */
export async function findProductById(id: string) {
  const products = await fetchLenderProducts();
  return products.find(p => p.id === id || p.productId === id) || null;
}

/**
 * ✅ ENABLED: Get products by category
 */
export async function getProductsByCategory(category: string) {
  const products = await fetchLenderProducts();
  return products.filter(p => 
    p.category?.toLowerCase() === category.toLowerCase() ||
    p.productCategory?.toLowerCase() === category.toLowerCase()
  );
}