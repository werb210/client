import { LenderProduct } from '@/hooks/useLocalLenders';

export interface RecommendationFormData {
  headquarters: string;
  fundingAmount: number;
  lookingFor: 'capital' | 'equipment' | 'both';
  accountsReceivableBalance: number;
  fundsPurpose: string;
}

export function filterProducts(products: LenderProduct[], form: RecommendationFormData): LenderProduct[] {
  const {
    headquarters,
    fundingAmount,
    lookingFor,
    accountsReceivableBalance,
    fundsPurpose,
  } = form;

  // Core filtering logic
  const matchesCore = products.filter(p =>
    // 1. Country match - geography contains headquarters
    p.geography.includes(headquarters) &&
    // 2. Amount range - within min/max bounds
    fundingAmount >= p.min_amount && fundingAmount <= p.max_amount &&
    // 3. Product-type rules
    (
      lookingFor === "both" ||
      (lookingFor === "capital" && p.product_type !== "equipment_financing") ||
      (lookingFor === "equipment" && p.product_type === "equipment_financing")
    )
  );

  // Extra inclusions based on special rules
  const extras = products.filter(p =>
    (
      // 4. AR balance rule - include invoice factoring if AR > 0
      accountsReceivableBalance > 0 && p.product_type === "invoice_factoring"
    ) ||
    (
      // 5. Inventory purpose rule - include purchase order financing for inventory
      fundsPurpose === "inventory" && p.product_type === "purchase_order_financing"
    )
  );

  // Merge and deduplicate by id
  const byId = new Map<string, LenderProduct>();
  [...matchesCore, ...extras].forEach(p => byId.set(p.id, p));
  
  return Array.from(byId.values());
}