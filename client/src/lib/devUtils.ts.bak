import { getProducts } from "../api/products";

/**
 * Product Compatibility Validation Script
 * Validates all lender products against Step 2 and Step 5 business logic requirements
 * Generated: July 21, 2025
 */

import { SUPPORTED_DOCUMENT_TYPES } from '../../../shared/documentTypes';

interface LenderProduct {
  id: string;
  name: string;
  lender_name: string;
  lenderName?: string;
  category: string;
  country: string;
  geography?: string[];
  // Amount fields (multiple variations)
  minAmount?: number;
  maxAmount?: number;
  amountMin?: number;
  amountMax?: number;
  amount_min?: number;
  amount_max?: number;
  min_amount?: number;
  max_amount?: number;
  fundingMin?: number;
  fundingMax?: number;
  // Document requirement fields (multiple variations)
  requiredDocuments?: string[];
  document_requirements?: string[];
  doc_requirements?: string[];
  documentRequirements?: string[];
  required_documents?: string[];
}

interface ProductCompatibilityResult {
  productId: string;
  productName: string;
  lenderName: string;
  category: string;
  country: string;
  compatibilityScore: number;
  issues: string[];
  warnings: string[];
  canAppearInStep2: boolean;
  canSupplyDocumentsStep5: boolean;
  details: {
    countryCompatible: boolean;
    categoryValid: boolean;
    hasAmountFields: boolean;
    hasDocumentFields: boolean;
    documentTypesRecognized: boolean;
    passesFiltering: boolean;
  };
}

interface ValidationSummary {
  totalProducts: number;
  fullyCompatible: number;
  partiallyCompatible: number;
  incompatible: number;
  averageCompatibilityScore: number;
  commonIssues: Record<string, number>;
  recommendations: string[];
}

/**
 * Geography normalization logic extracted from Step2RecommendationEngine.tsx
 */
const normalizeLocation = (location: string): string => {
  if (!location) return 'CA'; // DEFAULT TO CANADA
  const lower = location.toLowerCase();
  if (lower === 'united-states' || lower === 'united states' || lower === 'us') return 'US';
  if (lower === 'canada' || lower === 'ca') return 'CA';
  return location;
};

/**
 * Amount value extraction logic from recommendation.ts
 */
const getAmountValue = (product: LenderProduct, field: 'min' | 'max'): number => {
  let amount: any;
  if (field === 'min') {
    amount = product.minAmount ?? product.amountMin ?? product.amount_min ?? 
             product.min_amount ?? product.fundingMin ?? 0;
  } else {
    amount = product.maxAmount ?? product.amountMax ?? product.amount_max ?? 
             product.max_amount ?? product.fundingMax ?? Infinity;
  }
  
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? (field === 'min' ? 0 : Infinity) : parsed;
  }
  
  return typeof amount === 'number' ? amount : (field === 'min' ? 0 : Infinity);
};

/**
 * Category validation logic extracted from business rules
 */
const validateCategory = (category: string): { valid: boolean; normalizedCategory: string } => {
  if (!category) return { valid: false, normalizedCategory: '' };
  
  const categoryLower = category.toLowerCase();
  const knownCategories = [
    'factoring', 'invoice factoring', 'invoice', 
    'equipment', 'equipment financing',
    'term loan', 'business term loan',
    'line of credit', 'business line of credit', 'loc',
    'working capital', 'capital',
    'purchase order', 'purchase order financing', 'po financing',
    'asset based', 'asset-based lending', 'abl',
    'sba', 'sba loan'
  ];
  
  const isKnown = knownCategories.some(known => 
    categoryLower.includes(known) || known.includes(categoryLower)
  );
  
  return { valid: isKnown, normalizedCategory: categoryLower };
};

/**
 * Document type recognition using getApiCategory logic
 */
const getApiCategory = (label: string): string => {
  const labelLower = label.toLowerCase();
  
  // Bank statements - exact match
  if (labelLower.includes('bank') && labelLower.includes('statement')) {
    return 'bank_statements';
  }
  
  // Financial statements variations
  if (labelLower.includes('financial') && labelLower.includes('statement')) {
    return 'financial_statements';
  }
  if (labelLower.includes('accountant') && labelLower.includes('prepared')) {
    return 'financial_statements';
  }
  
  // Tax returns
  if (labelLower.includes('tax') && (labelLower.includes('return') || labelLower.includes('filing'))) {
    return 'tax_returns';
  }
  
  // Equipment quote
  if (labelLower.includes('equipment') && (labelLower.includes('quote') || labelLower.includes('invoice'))) {
    return 'equipment_quote';
  }
  
  // Business license
  if (labelLower.includes('business') && labelLower.includes('license')) {
    return 'business_license';
  }
  
  // Articles of incorporation
  if (labelLower.includes('article') && labelLower.includes('incorporation')) {
    return 'articles_of_incorporation';
  }
  
  // Voided check/PAD
  if ((labelLower.includes('void') || labelLower.includes('cancelled')) && 
      (labelLower.includes('check') || labelLower.includes('cheque'))) {
    return 'void_pad';
  }
  if (labelLower.includes('pad') || labelLower.includes('pre-authorized')) {
    return 'void_pad';
  }
  
  // Accounts receivable
  if (labelLower.includes('account') && labelLower.includes('receivable')) {
    return 'accounts_receivable';
  }
  
  // Accounts payable
  if (labelLower.includes('account') && labelLower.includes('payable')) {
    return 'accounts_payable';
  }
  
  // P&L Statement
  if ((labelLower.includes('profit') && labelLower.includes('loss')) || 
      labelLower.includes('p&l') || labelLower.includes('income statement')) {
    return 'profit_loss_statement';
  }
  
  // Balance sheet
  if (labelLower.includes('balance') && labelLower.includes('sheet')) {
    return 'balance_sheet';
  }
  
  // Cash flow statement
  if (labelLower.includes('cash') && labelLower.includes('flow')) {
    return 'cash_flow_statement';
  }
  
  // Personal financial statement
  if (labelLower.includes('personal') && labelLower.includes('financial')) {
    return 'personal_financial_statement';
  }
  
  // Business plan
  if (labelLower.includes('business') && labelLower.includes('plan')) {
    return 'business_plan';
  }
  
  // Invoice samples
  if (labelLower.includes('invoice') && (labelLower.includes('sample') || labelLower.includes('copy'))) {
    return 'invoice_samples';
  }
  
  // Personal guarantee
  if (labelLower.includes('personal') && labelLower.includes('guarantee')) {
    return 'personal_guarantee';
  }
  
  // Driver's license
  if (labelLower.includes('driver') && labelLower.includes('license')) {
    return 'drivers_license_front_back';
  }
  
  // Proof of identity
  if (labelLower.includes('proof') && labelLower.includes('identity')) {
    return 'proof_of_identity';
  }
  
  // Collateral documents
  if (labelLower.includes('collateral')) {
    return 'collateral_docs';
  }
  
  // Supplier agreement
  if (labelLower.includes('supplier') && labelLower.includes('agreement')) {
    return 'supplier_agreement';
  }
  
  // Signed application
  if (labelLower.includes('signed') && labelLower.includes('application')) {
    return 'signed_application';
  }
  
  return 'other';
};

/**
 * Check if document types are recognized by the system
 */
const validateDocumentTypes = (documents: string[]): { recognized: number; unrecognized: string[]; total: number } => {
  const unrecognized: string[] = [];
  let recognized = 0;
  
  documents.forEach(doc => {
    const apiCategory = getApiCategory(doc);
    if (SUPPORTED_DOCUMENT_TYPES.includes(apiCategory as any)) {
      recognized++;
    } else {
      unrecognized.push(`${doc} -> ${apiCategory}`);
    }
  });
  
  return { recognized, unrecognized, total: documents.length };
};

/**
 * Validate individual product compatibility
 */
const validateProduct = (product: LenderProduct): ProductCompatibilityResult => {
  const issues: string[] = [];
  const warnings: string[] = [];
  let compatibilityScore = 0;
  const maxScore = 100;
  
  // 1. Country Compatibility Check (20 points)
  let countryCompatible = false;
  if (product.country) {
    const normalized = normalizeLocation(product.country);
    const isStandardCountry = ['US', 'CA', 'Both'].includes(normalized);
    const hasGeographyArray = Array.isArray(product.geography) && product.geography.length > 0;
    const hasCountryIncludes = product.country.includes('CA') || product.country.includes('US');
    
    countryCompatible = isStandardCountry || hasGeographyArray || hasCountryIncludes;
    
    if (countryCompatible) {
      compatibilityScore += 20;
    } else {
      issues.push(`Country '${product.country}' not compatible with normalizeLocation() logic`);
    }
  } else {
    issues.push('Missing country field');
  }
  
  // 2. Category Validity Check (20 points)
  const categoryValidation = validateCategory(product.category);
  if (categoryValidation.valid) {
    compatibilityScore += 20;
  } else {
    issues.push(`Category '${product.category}' not recognized by business logic`);
  }
  
  // 3. Amount Fields Check (20 points)
  const minAmount = getAmountValue(product, 'min');
  const maxAmount = getAmountValue(product, 'max');
  const hasValidAmounts = (minAmount >= 0 && maxAmount > minAmount) || 
                         (minAmount === 0 && maxAmount === Infinity);
  
  if (hasValidAmounts) {
    compatibilityScore += 20;
  } else {
    issues.push(`Invalid amount range: min=${minAmount}, max=${maxAmount}`);
  }
  
  const hasAmountFields = !!(
    product.minAmount || product.maxAmount || product.amountMin || product.amountMax ||
    product.amount_min || product.amount_max || product.min_amount || product.max_amount ||
    product.fundingMin || product.fundingMax
  );
  
  if (!hasAmountFields) {
    warnings.push('No amount fields found - using defaults (min=0, max=∞)');
  }
  
  // 4. Document Fields Check (20 points)
  const documentFields = [
    product.requiredDocuments,
    product.document_requirements,
    product.doc_requirements,
    product.documentRequirements,
    product.required_documents
  ];
  
  const hasDocumentFields = documentFields.some(field => Array.isArray(field) && field.length > 0);
  const documentList = documentFields.find(field => Array.isArray(field) && field.length > 0) || [];
  
  if (hasDocumentFields) {
    compatibilityScore += 20;
  } else {
    issues.push('No document requirement fields found');
  }
  
  // 5. Document Type Recognition Check (20 points)
  let documentTypesRecognized = false;
  if (Array.isArray(documentList) && documentList.length > 0) {
    const validation = validateDocumentTypes(documentList);
    const recognitionRate = validation.recognized / validation.total;
    
    if (recognitionRate >= 0.8) {
      compatibilityScore += 20;
      documentTypesRecognized = true;
    } else {
      issues.push(`Only ${validation.recognized}/${validation.total} document types recognized`);
      validation.unrecognized.forEach(doc => warnings.push(`Unrecognized document: ${doc}`));
    }
  } else {
    issues.push('No documents to validate');
  }
  
  // Determine Step 2 and Step 5 compatibility
  const canAppearInStep2 = countryCompatible && categoryValidation.valid && hasValidAmounts;
  const canSupplyDocumentsStep5 = hasDocumentFields && documentTypesRecognized;
  
  return {
    productId: product.id,
    productName: product.name,
    lenderName: product.lender_name || product.lenderName || 'Unknown',
    category: product.category,
    country: product.country,
    compatibilityScore: Math.round((compatibilityScore / maxScore) * 100),
    issues,
    warnings,
    canAppearInStep2,
    canSupplyDocumentsStep5,
    details: {
      countryCompatible,
      categoryValid: categoryValidation.valid,
      hasAmountFields,
      hasDocumentFields,
      documentTypesRecognized,
      passesFiltering: canAppearInStep2
    }
  };
};

/**
 * Main validation function - analyzes all products
 */
export const validateAllProducts = async (): Promise<{ /* ensure products fetched */ 
  results: ProductCompatibilityResult[];
  summary: ValidationSummary;
}> => {
  console.log('🔍 Starting Product Compatibility Validation...');
  
  try {
    // Fetch all products from staff API
    const response = await fetch('https://staff.boreal.financial/api/v1/products')
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    let products: LenderProduct[];
    
    if (Array.isArray(data)) {
      products = data;
    } else if (data.success && Array.isArray(data.products)) {
      products = data.products;
    } else {
      throw new Error('Invalid API response format');
    }
    
    console.log(`📊 Analyzing ${products.length} products...`);
    
    // Validate each product
    const results = products.map(validateProduct);
    
    // Generate summary
    const totalProducts = results.length;
    const fullyCompatible = results.filter(r => r.compatibilityScore >= 90).length;
    const partiallyCompatible = results.filter(r => r.compatibilityScore >= 50 && r.compatibilityScore < 90).length;
    const incompatible = results.filter(r => r.compatibilityScore < 50).length;
    const averageCompatibilityScore = Math.round(
      results.reduce((sum, r) => sum + r.compatibilityScore, 0) / totalProducts
    );
    
    // Count common issues
    const commonIssues: Record<string, number> = {};
    results.forEach(result => {
      result.issues.forEach(issue => {
        commonIssues[issue] = (commonIssues[issue] || 0) + 1;
      });
    });
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (Object.keys(commonIssues).length > 0) {
      const topIssue = Object.entries(commonIssues).sort((a, b) => b[1] - a[1])[0];
      recommendations.push(`Most common issue: ${topIssue[0]} (${topIssue[1]} products affected)`);
    }
    
    const step2Compatible = results.filter(r => r.canAppearInStep2).length;
    const step5Compatible = results.filter(r => r.canSupplyDocumentsStep5).length;
    
    recommendations.push(`${step2Compatible}/${totalProducts} products can appear in Step 2`);
    recommendations.push(`${step5Compatible}/${totalProducts} products can supply documents in Step 5`);
    
    if (fullyCompatible < totalProducts * 0.8) {
      recommendations.push('Consider standardizing product data fields for better compatibility');
    }
    
    const summary: ValidationSummary = {
      totalProducts,
      fullyCompatible,
      partiallyCompatible,
      incompatible,
      averageCompatibilityScore,
      commonIssues,
      recommendations
    };
    
    console.log('✅ Product Compatibility Validation Complete');
    console.log(`📈 Summary: ${fullyCompatible} fully compatible, ${partiallyCompatible} partially compatible, ${incompatible} incompatible`);
    
    return { results, summary };
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  }
};

/**
 * Generate detailed compatibility report
 */
export const generateCompatibilityReport = async (): Promise<string> => {
  const { results, summary } = await validateAllProducts();
  
  const report = `
# PRODUCT COMPATIBILITY VALIDATION REPORT
Generated: ${new Date().toISOString()}

## SUMMARY
- **Total Products:** ${summary.totalProducts}
- **Fully Compatible (≥90%):** ${summary.fullyCompatible}
- **Partially Compatible (50-89%):** ${summary.partiallyCompatible}  
- **Incompatible (<50%):** ${summary.incompatible}
- **Average Compatibility Score:** ${summary.averageCompatibilityScore}%

## STEP COMPATIBILITY
- **Can Appear in Step 2:** ${results.filter(r => r.canAppearInStep2).length}/${summary.totalProducts}
- **Can Supply Documents Step 5:** ${results.filter(r => r.canSupplyDocumentsStep5).length}/${summary.totalProducts}

## COMMON ISSUES
${Object.entries(summary.commonIssues)
  .sort((a, b) => b[1] - a[1])
  .map(([issue, count]) => `- ${issue}: ${count} products`)
  .join('\n')}

## RECOMMENDATIONS
${summary.recommendations.map(rec => `- ${rec}`).join('\n')}

## DETAILED RESULTS
${results
  .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
  .map(result => `
### ${result.productName} (${result.lenderName})
- **Score:** ${result.compatibilityScore}%
- **Category:** ${result.category}
- **Country:** ${result.country}
- **Step 2 Compatible:** ${result.canAppearInStep2 ? '✅' : '❌'}
- **Step 5 Compatible:** ${result.canSupplyDocumentsStep5 ? '✅' : '❌'}
- **Issues:** ${result.issues.length > 0 ? result.issues.join(', ') : 'None'}
- **Warnings:** ${result.warnings.length > 0 ? result.warnings.join(', ') : 'None'}
`).join('\n')}
`;
  
  return report;
};

/**
 * Browser console helper - run validation and log results
 */
(window as any).validateProducts = async () => {
  try {
    const report = await generateCompatibilityReport();
    console.log(report);
    return report;
  } catch (error) {
    console.error('Validation failed:', error);
  }
};

/**
 * Browser console helper - run quick validation
 */
(window as any).quickValidation = async () => {
  try {
    const { summary } = await validateAllProducts();
    console.table(summary);
    return summary;
  } catch (error) {
    console.error('Validation failed:', error);
  }
};
// injected: local-first products fetch
import { getProducts, loadSelectedCategories } from "../api/products";
/* injected load on mount (pseudo):
useEffect(() => { (async () => {
  const cats = loadSelectedCategories();
  const products = await getProducts({ useCacheFirst: true });
  // apply category filter if present
  const selected = cats && cats.length ? products.filter(p => cats.includes((p.category||"").toLowerCase())) : products;
  setState({ products: selected });
})(); }, []);
*/
