/**
 * Enhanced Lender Product Interface
 * Supports all 9 new fields from staff backend API v2 schema
 */

export interface EnhancedLenderProduct {
  // Core fields
  id: string;
  productName?: string;
  name?: string; // Legacy compatibility
  lenderName: string;
  category: string;
  country: string;
  
  // Amount fields (enhanced)
  amountRange?: {
    min: number;
    max: number;
  };
  minAmount?: number; // Legacy compatibility
  maxAmount?: number; // Legacy compatibility
  minAmountUsd?: number; // New field
  maxAmountUsd?: number; // New field
  
  // NEW FIELD 1-3: Interest rate range
  interestRateMin?: number;
  interestRateMax?: number;
  interestRateType?: 'fixed' | 'variable' | 'both';
  
  // NEW FIELD 4-5: Term length range
  termMin?: number; // in months
  termMax?: number; // in months
  termUnit?: 'months' | 'years';
  
  // NEW FIELD 6: Credit requirements
  minCreditScore?: number;
  creditScoreType?: 'personal' | 'business' | 'either';
  
  // NEW FIELD 7: Revenue requirements
  minRevenue?: number;
  minRevenueUsd?: number;
  revenueRequirement?: string;
  
  // NEW FIELD 8: Industry restrictions
  eligibleIndustries?: string[];
  excludedIndustries?: string[];
  industryRestrictions?: string;
  
  // NEW FIELD 9: Documentation requirements
  requiredDocuments?: string[];
  documentRequirements?: string[];
  documentationLevel?: 'minimal' | 'standard' | 'comprehensive';
  
  // Additional enhanced fields
  description?: string;
  applicationProcess?: string;
  approvalTimeframe?: string;
  collateralRequired?: boolean;
  personalGuaranteeRequired?: boolean;
  
  // Metadata
  lastUpdated?: number;
  dataSource?: 'staff_api' | 'cache' | 'fallback';
  schemaVersion?: 'v1' | 'v2';
}

export interface ProductStats {
  productCount: number;
  source: 'staff_api' | 'cache' | 'fallback';
  categories: string[];
  lastSynced: number;
  hasNewFields: boolean;
  schemaVersion: 'v1' | 'v2';
  newFieldsPresent: {
    interestRate: boolean;
    termLength: boolean;
    creditScore: boolean;
    revenue: boolean;
    industries: boolean;
    documents: boolean;
  };
}

/**
 * Validates if a product has the new v2 schema fields
 */
export function validateV2Schema(product: any): boolean {
  const hasInterestRate = product.interestRateMin !== undefined || product.interestRateMax !== undefined;
  const hasTermLength = product.termMin !== undefined || product.termMax !== undefined;
  const hasCreditScore = product.minCreditScore !== undefined;
  const hasRevenue = product.minRevenue !== undefined || product.minRevenueUsd !== undefined;
  const hasIndustries = product.eligibleIndustries !== undefined || product.excludedIndustries !== undefined;
  const hasDocuments = product.requiredDocuments !== undefined || product.documentRequirements !== undefined;
  
  // At least 3 of the 6 new field categories should be present for v2 schema
  const fieldCount = [hasInterestRate, hasTermLength, hasCreditScore, hasRevenue, hasIndustries, hasDocuments].filter(Boolean).length;
  return fieldCount >= 3;
}

/**
 * Normalizes product from any schema version to enhanced format
 */
export function normalizeProduct(product: any): EnhancedLenderProduct {
  return {
    id: product.id,
    productName: product.productName || product.name,
    name: product.name || product.productName,
    lenderName: product.lenderName || product.lender,
    category: product.category || product.productCategory,
    country: product.country || product.geography,
    
    // Amount normalization
    amountRange: product.amountRange || (product.minAmount && product.maxAmount ? 
      { min: product.minAmount, max: product.maxAmount } : undefined),
    minAmount: product.minAmount || product.amountRange?.min,
    maxAmount: product.maxAmount || product.amountRange?.max,
    minAmountUsd: product.minAmountUsd,
    maxAmountUsd: product.maxAmountUsd,
    
    // New v2 fields
    interestRateMin: product.interestRateMin,
    interestRateMax: product.interestRateMax,
    interestRateType: product.interestRateType,
    
    termMin: product.termMin,
    termMax: product.termMax,
    termUnit: product.termUnit || 'months',
    
    minCreditScore: product.minCreditScore,
    creditScoreType: product.creditScoreType,
    
    minRevenue: product.minRevenue,
    minRevenueUsd: product.minRevenueUsd,
    revenueRequirement: product.revenueRequirement,
    
    eligibleIndustries: product.eligibleIndustries,
    excludedIndustries: product.excludedIndustries,
    industryRestrictions: product.industryRestrictions,
    
    requiredDocuments: product.requiredDocuments || product.documentRequirements,
    documentRequirements: product.documentRequirements || product.requiredDocuments,
    documentationLevel: product.documentationLevel,
    
    // Additional fields
    description: product.description,
    applicationProcess: product.applicationProcess,
    approvalTimeframe: product.approvalTimeframe,
    collateralRequired: product.collateralRequired,
    personalGuaranteeRequired: product.personalGuaranteeRequired,
    
    // Metadata
    lastUpdated: Date.now(),
    dataSource: product.dataSource || 'staff_api',
    schemaVersion: validateV2Schema(product) ? 'v2' : 'v1'
  };
}