// Staff Database Product Type (C-1: Updated to match actual API response)
export interface StaffLenderProduct {
  id: string;
  name: string; // Changed from productName to name
  lenderName: string;
  category: string; // e.g., 'term_loan', 'line_of_credit', 'equipment_financing', etc.
  geography: string[]; // e.g., ['US'], ['CA'], ['US', 'CA']
  amountMin: number; // Changed from amountRange.min to amountMin
  amountMax: number; // Changed from amountRange.max to amountMax
  requirements: {
    minMonthlyRevenue: string;
    industries: string[] | null;
  };
  description: string; // Contains rate, terms, and document info
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

  // Core filtering logic - C-1: Use amountMin/amountMax from API
  const matchesCore = products.filter(product => {
    const minAmount = getAmountValue(product.amountMin);
    const maxAmount = getAmountValue(product.amountMax);
    
    return (
      // 1. Country match - geography contains headquarters
      product.geography.includes(headquarters) &&
      // 2. Amount range - within min/max bounds
      fundingAmount >= minAmount && fundingAmount <= maxAmount &&
      // 3. Product-type rules using staff database categories
      (
        lookingFor === "both" ||
        (lookingFor === "capital" && product.category !== "equipment_financing") ||
        (lookingFor === "equipment" && product.category === "equipment_financing")
      )
    );
  });

  // Extra inclusions based on special rules - C-1: Use amountMin/amountMax from API
  const extras = products.filter(product => {
    const minAmount = getAmountValue(product.amountMin);
    const maxAmount = getAmountValue(product.amountMax);
    
    return (
      // Geography and amount must still match for extras
      product.geography.includes(headquarters) &&
      fundingAmount >= minAmount && fundingAmount <= maxAmount &&
      (
        // 4. AR balance rule - include invoice factoring if AR > 0
        (accountsReceivableBalance > 0 && product.category === "invoice_factoring") ||
        // 5. Inventory purpose rule - include purchase order financing for inventory
        (fundsPurpose === "inventory" && product.category === "purchase_order_financing")
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

  const minAmount = parseFloat(product.amountRange.min) || 0;
  const maxAmount = parseFloat(product.amountRange.max) || 0;
  const minMonthlyRevenue = parseFloat(product.requirements.minMonthlyRevenue) || 0;

  // Geography match (25 points)
  if (product.geography.includes(headquarters)) {
    score += 25;
  }

  // Funding range match (25 points)
  if (fundingAmount >= minAmount && fundingAmount <= maxAmount) {
    score += 25;
  }

  // Product type preference match (25 points)
  if (lookingFor === "both" ||
      (lookingFor === "capital" && product.category !== "equipment_financing") ||
      (lookingFor === "equipment" && product.category === "equipment_financing")) {
    score += 25;
  }

  // Revenue requirement match (25 points)
  if (monthlyRevenue >= minMonthlyRevenue) {
    score += 25;
  }

  // Bonus points for special matching rules
  if (accountsReceivableBalance > 0 && product.category === "invoice_factoring") {
    score += 10; // Bonus for AR factoring match
  }
  
  if (fundsPurpose === "inventory" && product.category === "purchase_order_financing") {
    score += 10; // Bonus for PO financing match
  }

  return Math.min(score, 100); // Cap at 100%
}