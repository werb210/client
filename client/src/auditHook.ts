// Attach a read-only audit function in dev/audit mode.
// Implement resolveClientProducts() to return the array from your client DB.
async function resolveClientProducts(): Promise<any[]> {
  // Get products from localStorage cache (our client DB)
  try {
    const cachedData = localStorage.getItem('lender_products_cache');
    if (cachedData) {
      const products = JSON.parse(cachedData);
      if (Array.isArray(products)) {
        return products;
      }
    }
  } catch (error) {
    console.warn('[AUDIT] Failed to read localStorage cache:', error);
  }
  
  // Fallback to empty array if cache is missing/invalid
  return [];
}

export async function installAuditHook() {
  if ((import.meta as any).env?.VITE_AUDIT !== '1') return;
  (window as any).__audit_getLenderProducts = async () => {
    const items = await resolveClientProducts();
    return items.map(p => ({
      id: p.id, 
      lender_id: p.lender_id || p.lenderId, 
      name: p.name || p.productName,
      country: p.country || p.countryOffered, 
      amount_min: p.amount_min || p.minAmount, 
      amount_max: p.amount_max || p.maxAmount, 
      active: p.active !== false && p.isActive !== false
    }));
  };
  console.info('[AUDIT] __audit_getLenderProducts installed');
}