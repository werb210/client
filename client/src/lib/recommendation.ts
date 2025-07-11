// Staff Database Product Type (Updated to match usePublicLenders interface)
export interface StaffLenderProduct {
  id: string;
  product_name: string;
  lender_name: string;
  product_type: string; // e.g., 'term_loan', 'line_of_credit', 'equipment_financing', etc.
  geography: string[]; // e.g., ['US'], ['CA'], ['US', 'CA']
  min_amount: number;
  max_amount: number;
  min_revenue: number;
  industries: string[];
  description: string;
  interest_rate_min: number;
  interest_rate_max: number;
  term_min: number;
  term_max: number;
  requirements: string[];
  active: boolean;
}

export interface RecommendationFormData {
  headquarters: string; // 'US' or 'CA'
  fundingAmount: number;
  lookingFor: 'capital' | 'equipment' | 'both';
  accountsReceivableBalance: number;
  fundsPurpose: string;
}

/**
 * Apply your business rules to filter staff database products
 * Based on Step 1 user answers to recommend best product categories
 */
export function filterProducts(products: StaffLenderProduct[], form: RecommendationFormData): StaffLenderProduct[] {
  const {
    headquarters,
    fundingAmount,
    lookingFor,
    accountsReceivableBalance,
    fundsPurpose,
  } = form;

  // Convert amounts to numbers for comparison - handles both string and number types
  const getAmountValue = (amount: string | number): number => {
    if (typeof amount === 'number') return amount;
    return parseFloat(amount) || 0;
  };

  // Core filtering logic - Updated to use actual API response format
  const matchesCore = products.filter(product => {
    const minAmount = getAmountValue(product.min_amount);
    const maxAmount = getAmountValue(product.max_amount);
    
    // Safe geography check - handle both string and array
    const geography = Array.isArray(product.geography) ? product.geography : 
                     typeof product.geography === 'string' ? [product.geography] : [];
    
    return (
      // 1. Country match - geography contains headquarters
      geography.includes(headquarters) &&
      // 2. Amount range - within min/max bounds
      fundingAmount >= minAmount && fundingAmount <= maxAmount &&
      // 3. Product-type rules using staff database categories
      (
        lookingFor === "both" ||
        (lookingFor === "capital" && product.product_type !== "equipment_financing") ||
        (lookingFor === "equipment" && product.product_type === "equipment_financing")
      )
    );
  });

  // Extra inclusions based on special rules - Updated to use actual API response format
  const extras = products.filter(product => {
    const minAmount = getAmountValue(product.min_amount);
    const maxAmount = getAmountValue(product.max_amount);
    
    // Safe geography check - handle both string and array
    const geography = Array.isArray(product.geography) ? product.geography : 
                     typeof product.geography === 'string' ? [product.geography] : [];
    
    return (
      // Geography and amount must still match for extras
      geography.includes(headquarters) &&
      fundingAmount >= minAmount && fundingAmount <= maxAmount &&
      (
        // 4. AR balance rule - include invoice factoring if AR > 0
        (accountsReceivableBalance > 0 && product.product_type === "invoice_factoring") ||
        // 5. Inventory purpose rule - include purchase order financing for inventory
        (fundsPurpose === "inventory" && product.product_type === "purchase_order_financing")
      )
    );
  });

  // Merge and deduplicate by id
  const byId = new Map<string, StaffLenderProduct>();
  [...matchesCore, ...extras].forEach(p => byId.set(p.id, p));
  
  return Array.from(byId.values());
}

/**
 * Calculate recommendation score based on Step 1 form data
 */
export function calculateRecommendationScore(
  product: StaffLenderProduct, 
  form: RecommendationFormData,
  monthlyRevenue: number
): number {
  let score = 0;
  const {
    headquarters,
    fundingAmount,
    lookingFor,
    accountsReceivableBalance,
    fundsPurpose,
  } = form;

  const minAmount = getAmountValue(product.min_amount);
  const maxAmount = getAmountValue(product.max_amount);
  const minMonthlyRevenue = product.min_revenue || 0;

  // Geography match (25 points) - Safe geography check
  const geography = Array.isArray(product.geography) ? product.geography : 
                   typeof product.geography === 'string' ? [product.geography] : [];
  if (geography.includes(headquarters)) {
    score += 25;
  }

  // Funding range match (25 points)
  if (fundingAmount >= minAmount && fundingAmount <= maxAmount) {
    score += 25;
  }

  // Product type preference match (25 points)
  if (lookingFor === "both" ||
      (lookingFor === "capital" && product.product_type !== "equipment_financing") ||
      (lookingFor === "equipment" && product.product_type === "equipment_financing")) {
    score += 25;
  }

  // Revenue requirement match (25 points)
  if (monthlyRevenue >= minMonthlyRevenue) {
    score += 25;
  }

  // Bonus points for special matching rules
  if (accountsReceivableBalance > 0 && product.product_type === "invoice_factoring") {
    score += 10; // Bonus for AR factoring match
  }
  
  if (fundsPurpose === "inventory" && product.product_type === "purchase_order_financing") {
    score += 10; // Bonus for PO financing match
  }

  return Math.min(score, 100); // Cap at 100%
}