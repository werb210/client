import { getProducts } from "../../api/products";
/**
 * ❌ DISABLED: Advanced recommendation engine is not allowed on client
 * All recommendation processing is handled server-side by Staff App
 * for security and to prevent data leakage
 */

export interface LenderProduct {
  id: string;
  name: string;
  [key: string]: any;
}

export interface ScoredProduct extends LenderProduct {
  matchScore: number;
  rejectionReasons: string[];
}

export interface RecommendationInput {
  country: string;
  amountRequested: number;
  category: string;
}

/**
 * ❌ DISABLED: All recommendation engine functions blocked
 */
export function filterAndScoreProducts(): ScoredProduct[] {
  throw new Error("Product filtering and scoring restricted - handled server-side only");
}

export function calculateAdvancedScore(): number {
  throw new Error("Advanced scoring restricted - handled server-side only");
}

export function applyBusinessRules(): never[] {
  throw new Error("Business rules application restricted - handled server-side only");
}

export function generateRecommendations(): never[] {
  throw new Error("Recommendation generation restricted - handled server-side only");
}

/**
 * 🔒 SECURITY: All recommendation data blocked
 */
export const RECOMMENDATION_ENGINE_DISABLED = {
  message: "Recommendation engine access restricted to Staff App",
  status: "disabled_on_client",
  serverSideOnly: true
} as const;