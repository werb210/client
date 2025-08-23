/**
 * ❌ DISABLED: Client-side recommendation system is not allowed
 * All lender recommendations are processed server-side by Staff App
 * after complete document review and verification
 */

export interface RecommendationFormData {
  headquarters: string;
  fundingAmount: number;
  lookingFor: 'capital' | 'equipment' | 'both';
  accountsReceivableBalance: number;
  fundsPurpose: string;
}

/**
 * ❌ DISABLED: Product filtering not allowed on client
 */
export function filterProducts(): never[] {
  throw new Error("Product filtering restricted - recommendations handled server-side only");
}

/**
 * ❌ DISABLED: Recommendation scoring not allowed on client
 */
export function calculateRecommendationScore(): number {
  throw new Error("Recommendation scoring restricted - handled server-side only");
}

/**
 * ❌ DISABLED: All other recommendation functions disabled
 */
export function getProductsByCategory(): never[] {
  return [];
}

export function findBestMatch(): null {
  return null;
}

export function calculateMatchPercentage(): number {
  return 0;
}

/**
 * 🔒 SECURITY MESSAGE: Client cannot access lender data
 */
export const RECOMMENDATION_DISABLED_MESSAGE = {
  title: "Lender Matching In Progress",
  message: "We'll match you with lenders once your documents are reviewed.",
  status: "pending_review",
  action: "Complete document upload to proceed with matching",
  icon: "⏳"
} as const;

// All exports disabled for security
export type StaffLenderProduct = never;
export type LenderProduct = never;