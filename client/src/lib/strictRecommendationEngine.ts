import { LenderProduct as ImportedLenderProduct } from '../types/lenderProduct';

/**
 * Strict recommendation engine that only operates on validated LenderProduct data
 * No string matching or guessing - relies on validated enums and structured data
 */

export interface LenderProduct {
  id: string;
  name: string;
  lender: string;
  category: 'working_capital' | 'equipment_financing' | 'invoice_factoring' | 'line_of_credit' | 'term_loan' | 'purchase_order_financing' | 'asset_based_lending' | 'sba_loan';
  country: 'CA' | 'US';
  minAmount: number;
  maxAmount: number;
  minRevenue?: number;
  isActive: boolean;
}

export interface RecommendationFilters {
  country: LenderProduct['country'];
  fundingAmount: number;
  lookingFor: 'capital' | 'equipment' | 'both';
  accountsReceivableBalance?: number;
  fundsPurpose?: 'inventory' | 'expansion' | 'equipment' | 'working_capital' | 'other';
}

export interface ProductRecommendation {
  product: LenderProduct;
  matchScore: number;
  matchReasons: string[];
  recommendationLevel: 'excellent' | 'good' | 'fair';
}

/**
 * Filter and score products based on strict business rules
 * No fallback logic - fails fast if product data is invalid
 */
export function getProductRecommendations(
  products: LenderProduct[],
  filters: RecommendationFilters
): ProductRecommendation[] {
  
  console.log(`[RECOMMENDATION] Filtering ${products.length} validated products`);
  console.log('[RECOMMENDATION] Filters:', filters);
  
  // Validate that all products have required fields
  validateProductData(products);
  
  // Step 1: Hard filters (must match)
  const eligibleProducts = products.filter(product => {
    return matchesGeography(product, filters) && 
           matchesAmountRange(product, filters) &&
           matchesProductType(product, filters);
  });
  
  console.log(`[RECOMMENDATION] ${eligibleProducts.length} products passed hard filters`);
  
  // Step 2: Score and rank eligible products
  const recommendations = eligibleProducts.map(product => {
    const score = calculateMatchScore(product, filters);
    const reasons = getMatchReasons(product, filters);
    const level = getRecommendationLevel(score);
    
    return {
      product,
      matchScore: score,
      matchReasons: reasons,
      recommendationLevel: level
    };
  });
  
  // Sort by score (highest first)
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  
  console.log(`[RECOMMENDATION] Generated ${recommendations.length} recommendations`);
  return recommendations;
}

/**
 * Validate that products have all required fields for recommendations
 */
function validateProductData(products: LenderProduct[]): void {
  products.forEach((product, index) => {
    if (!product.category) {
      throw new Error(`Product ${index} missing category: ${product.name}`);
    }
    if (!product.country) {
      throw new Error(`Product ${index} missing country: ${product.name}`);
    }
    if (typeof product.minAmount !== 'number' || typeof product.maxAmount !== 'number') {
      throw new Error(`Product ${index} invalid amount range: ${product.name}`);
    }
  });
}

/**
 * Geography matching - exact enum match required
 */
function matchesGeography(product: LenderProduct, filters: RecommendationFilters): boolean {
  return product.country === filters.country;
}

/**
 * Amount range matching - funding amount must fall within product range
 */
function matchesAmountRange(product: LenderProduct, filters: RecommendationFilters): boolean {
  return filters.fundingAmount >= product.minAmount && 
         filters.fundingAmount <= product.maxAmount;
}

/**
 * Product type matching based on strict category enum
 */
function matchesProductType(product: LenderProduct, filters: RecommendationFilters): boolean {
  const { lookingFor, accountsReceivableBalance, fundsPurpose } = filters;
  
  switch (lookingFor) {
    case 'capital':
      // Capital includes: term_loan, working_capital, line_of_credit
      const capitalTypes: LenderProduct['category'][] = [
        'term_loan', 
        'working_capital', 
        'line_of_credit'
      ];
      return capitalTypes.includes(product.category);
      
    case 'equipment':
      // Equipment includes: equipment_financing only
      return product.category === 'equipment_financing';
      
    case 'both':
      // Both includes all capital types + equipment_financing
      const bothTypes: LenderProduct['category'][] = [
        'term_loan', 
        'working_capital', 
        'line_of_credit',
        'equipment_financing'
      ];
      return bothTypes.includes(product.category);
      
    default:
      console.error(`Unknown lookingFor value: ${lookingFor}`);
      return false;
  }
}

/**
 * Calculate match score based on multiple factors
 */
function calculateMatchScore(product: LenderProduct, filters: RecommendationFilters): number {
  let score = 0;
  
  // Base score for category match
  score += getCategoryScore(product.category, filters);
  
  // Amount optimization score (closer to minimum = better)
  score += getAmountOptimizationScore(product, filters);
  
  // Revenue requirement score
  score += getRevenueScore(product, filters);
  
  // Special inclusions score
  score += getSpecialInclusionScore(product, filters);
  
  return Math.min(100, Math.max(0, score));
}

function getCategoryScore(category: LenderProduct['category'], filters: RecommendationFilters): number {
  const { lookingFor } = filters;
  
  const categoryScores: Record<LenderProduct['category'], Record<string, number>> = {
    'term_loan': { capital: 30, equipment: 0, both: 25 },
    'working_capital': { capital: 25, equipment: 0, both: 20 },
    'line_of_credit': { capital: 20, equipment: 0, both: 15 },
    'equipment_financing': { capital: 0, equipment: 30, both: 25 },
    'invoice_factoring': { capital: 15, equipment: 0, both: 10 },
    'purchase_order_financing': { capital: 10, equipment: 0, both: 5 },
    'asset_based_lending': { capital: 15, equipment: 5, both: 10 },
    'sba_loan': { capital: 25, equipment: 15, both: 20 }
  };
  
  return categoryScores[category]?.[lookingFor] || 0;
}

function getAmountOptimizationScore(product: LenderProduct, filters: RecommendationFilters): number {
  const { fundingAmount } = filters;
  const ratio = fundingAmount / product.minAmount;
  
  if (ratio >= 1 && ratio <= 2) return 20; // Optimal range
  if (ratio > 2 && ratio <= 5) return 15;  // Good range
  if (ratio > 5) return 10;                // Acceptable
  return 5; // Edge case
}

function getRevenueScore(product: LenderProduct, filters: RecommendationFilters): number {
  if (!product.minRevenue) return 10; // No revenue requirement = bonus
  
  // Assume reasonable revenue based on funding amount
  const estimatedRevenue = filters.fundingAmount * 2; // Conservative estimate
  
  if (estimatedRevenue >= product.minRevenue) return 10;
  return 0;
}

function getSpecialInclusionScore(product: LenderProduct, filters: RecommendationFilters): number {
  let score = 0;
  
  // Invoice factoring bonus for accounts receivable
  if (product.category === 'invoice_factoring' && 
      filters.accountsReceivableBalance && 
      filters.accountsReceivableBalance > 0) {
    score += 15;
  }
  
  // Purchase order financing bonus for inventory purpose
  if (product.category === 'purchase_order_financing' && 
      filters.fundsPurpose === 'inventory') {
    score += 15;
  }
  
  return score;
}

function getMatchReasons(product: LenderProduct, filters: RecommendationFilters): string[] {
  const reasons: string[] = [];
  
  reasons.push(`Available in ${filters.country}`);
  reasons.push(`Supports $${filters.fundingAmount.toLocaleString()} funding range`);
  
  // Category-specific reasons
  switch (product.category) {
    case 'term_loan':
      reasons.push('Term loan for business growth and expansion');
      break;
    case 'working_capital':
      reasons.push('Working capital for operational expenses');
      break;
    case 'line_of_credit':
      reasons.push('Flexible credit line for ongoing needs');
      break;
    case 'equipment_financing':
      reasons.push('Specialized equipment financing');
      break;
    case 'invoice_factoring':
      reasons.push('Convert receivables to immediate cash');
      break;
  }
  
  // Revenue advantage
  if (!product.minRevenue || product.minRevenue <= filters.fundingAmount * 2) {
    reasons.push('Revenue requirements likely met');
  }
  
  return reasons;
}

function getRecommendationLevel(score: number): 'excellent' | 'good' | 'fair' {
  if (score >= 70) return 'excellent';
  if (score >= 50) return 'good';
  return 'fair';
}

/**
 * Get products by specific category with validation
 */
export function getProductsByCategory(
  products: LenderProduct[],
  category: LenderProduct['category']
): LenderProduct[] {
  validateProductData(products);
  return products.filter(product => product.category === category);
}

/**
 * Get available categories from validated products
 */
export function getAvailableCategories(products: LenderProduct[]): LenderProduct['category'][] {
  validateProductData(products);
  const categories = new Set(products.map(product => product.category));
  return Array.from(categories);
}