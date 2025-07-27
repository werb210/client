/**
 * Document Aggregation Logic for Step 5
 * Implements union of all required documents across eligible lender products
 * Based on ChatGPT team specifications
 */

// Document aggregation with normalization support
import { normalizeDocumentName } from '../../../shared/documentMapping';
import { getDocumentLabel } from '../../../shared/documentTypes';

interface LenderProduct {
  id: string;
  name: string;
  lender_name: string;
  category: string;
  country: string;
  min_amount: number;
  max_amount: number;
  doc_requirements?: string[];
  documentRequirements?: string[];
  requiredDocuments?: string[];
  required_documents?: string[];
}

interface DocumentAggregationResult {
  eligibleProducts: LenderProduct[];
  requiredDocuments: string[];
  message: string;
  hasMatches: boolean;
}

/**
 * Get document requirements using aggregation logic (union of all eligible products)
 * Following ChatGPT team specifications for complete document collection
 */
export async function getDocumentRequirementsAggregation(
  selectedCategory: string,
  selectedCountry: string,
  requestedAmount: number
): Promise<DocumentAggregationResult> {
  
  console.log(`🔍 [AGGREGATION] Starting document aggregation for: "${selectedCategory}" in ${selectedCountry} for $${requestedAmount.toLocaleString()}`);
  
  try {
    // Fetch all lender products from staff API
    const response = await fetch('/api/public/lenders');
    
    if (!response.ok) {
      throw new Error(`Staff API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`📊 [AGGREGATION] API response received, processing data...`);
    
    // Handle both direct array and wrapped response formats
    let allProducts;
    if (Array.isArray(data)) {
      allProducts = data;
      console.log(`📦 [AGGREGATION] Direct array response: ${allProducts.length} products`);
    } else if (data.success && Array.isArray(data.products)) {
      allProducts = data.products;
      console.log(`📦 [AGGREGATION] Wrapped response: ${allProducts.length} products`);
    } else {
      console.error('❌ [AGGREGATION] Invalid API response format:', data);
      throw new Error('Invalid API response format');
    }
    
    // ✅ CRITICAL FIX: Map Step 2 category names to backend category names
    const categoryMappings: Record<string, string[]> = {
      'Working Capital': ['Working Capital', 'working_capital', 'Working Capital Loan'],
      'Term Loan': ['Term Loan', 'term_loan', 'Term Loans'],
      'Business Line of Credit': ['Line of Credit', 'line_of_credit', 'Business Line of Credit', 'LOC'],
      'Equipment Financing': ['Equipment Financing', 'equipment_financing', 'Equipment Finance'],
      'Invoice Factoring': ['Invoice Factoring', 'invoice_factoring', 'Factoring'],
      'Purchase Order Financing': ['Purchase Order Financing', 'purchase_order_financing', 'PO Financing'],
      'Asset-Based Lending': ['Asset-Based Lending', 'asset_based_lending', 'ABL']
    };
    
    const mappedCategories = categoryMappings[selectedCategory] || [selectedCategory];
    console.log(`🗂️ [AGGREGATION] Category "${selectedCategory}" mapped to: [${mappedCategories.join(', ')}]`);
    
    // Normalize country format
    const normalizedCountry = selectedCountry === 'canada' || selectedCountry === 'Canada' ? 'CA' :
                             selectedCountry === 'united-states' || selectedCountry === 'United States' ? 'US' :
                             selectedCountry;
    
    console.log(`🌍 [AGGREGATION] Country normalized: "${selectedCountry}" → "${normalizedCountry}"`);
    
    // ✅ STEP 1: Filter all local lender products that match criteria
    const eligibleProducts = allProducts.filter((product: any) => {
      // Category match - use flexible mapping
      const categoryMatch = mappedCategories.some(cat => 
        product.category === cat || 
        product.category?.toLowerCase() === cat.toLowerCase() ||
        product.productType === cat ||
        product.type === cat
      );
      
      // Country match
      const countryMatch = product.country === normalizedCountry || 
                          product.geography === normalizedCountry ||
                          product.region === normalizedCountry;
      
      // Amount range match
      const minAmount = product.min_amount || product.amountMin || product.amount_min || 0;
      const maxAmount = product.max_amount || product.amountMax || product.amount_max || Number.MAX_SAFE_INTEGER;
      const amountMatch = minAmount <= requestedAmount && maxAmount >= requestedAmount;
      
      const isEligible = categoryMatch && countryMatch && amountMatch;
      
      // Enhanced logging for debugging
      console.log(`🧪 [AGGREGATION] Product "${product.name}" - Category: ${categoryMatch ? '✅' : '❌'} (${product.category}), Country: ${countryMatch ? '✅' : '❌'} (${product.country}), Amount: ${amountMatch ? '✅' : '❌'} ($${minAmount}-$${maxAmount}), Eligible: ${isEligible ? '✅' : '❌'}`);
      
      return isEligible;
    });
    
    console.log(`🎯 [AGGREGATION] Filtering complete: ${eligibleProducts.length} eligible products found`);
    
    if (eligibleProducts.length === 0) {
      console.log(`❌ [AGGREGATION] No products match criteria - providing fallback documents`);
      
      // ✅ FALLBACK LOGIC: If no products match, provide standard documents based on category
      const fallbackDocuments = getFallbackDocumentsForCategory(selectedCategory);
      
      return {
        eligibleProducts: [],
        requiredDocuments: fallbackDocuments,
        message: `No exact matches found for ${selectedCategory} in ${selectedCountry} for $${requestedAmount.toLocaleString()}. Showing standard documents for ${selectedCategory}.`,
        hasMatches: false
      };
    }
    
    // ✅ STEP 2: Aggregate and deduplicate required documents (UNION) - ENHANCED WITH NORMALIZATION
    // Following user specifications for canonical document type normalization
    const { extractDocRequirements, getCanonicalDocumentInfo } = await import('./docNormalization');
    const canonicalDocTypes = extractDocRequirements(eligibleProducts);
    
    console.log(`🔍 [AGGREGATION] Normalized to ${canonicalDocTypes.length} canonical document types:`, canonicalDocTypes);
    
    // Convert canonical types to display labels for UI
    const transformedDocuments = canonicalDocTypes.map(docType => {
      const info = getCanonicalDocumentInfo(docType);
      console.log(`✅ [AGGREGATION] Canonical document: ${docType} → "${info.label}"`);
      return info.label;
    });
    
    console.log(`✅ [AGGREGATION] Successfully aggregated ${transformedDocuments.length} document requirements from ${eligibleProducts.length} eligible products`);
    
    return {
      eligibleProducts,
      requiredDocuments: transformedDocuments,
      message: `Documents required across ${eligibleProducts.length} eligible ${selectedCategory} lenders`,
      hasMatches: true
    };
    
  } catch (error) {
    console.error('❌ [AGGREGATION] Error calculating document requirements:', error);
    
    // Provide fallback documents even on error
    const fallbackDocuments = getFallbackDocumentsForCategory(selectedCategory);
    
    return {
      eligibleProducts: [],
      requiredDocuments: fallbackDocuments,
      message: `Error fetching requirements (${error instanceof Error ? error.message : 'Unknown error'}). Showing standard documents for ${selectedCategory}.`,
      hasMatches: false
    };
  }
}

/**
 * Get fallback document requirements when no products match
 */
function getFallbackDocumentsForCategory(category: string): string[] {
  const fallbackMappings: Record<string, string[]> = {
    'Working Capital': ['Bank Statements', 'Financial Statements', 'Business Tax Returns'],
    'Term Loan': ['Bank Statements', 'Business Tax Returns', 'Financial Statements', 'Cash Flow Statement'],
    'Business Line of Credit': ['Bank Statements', 'Financial Statements', 'Business Tax Returns'],
    'Equipment Financing': ['Equipment Quote', 'Bank Statements', 'Business Tax Returns'],
    'Invoice Factoring': ['Accounts Receivable Aging', 'Bank Statements', 'Invoice Samples'],
    'Purchase Order Financing': ['Purchase Orders', 'Bank Statements', 'Customer Credit Information'],
    'Asset-Based Lending': ['Asset Valuation', 'Bank Statements', 'Financial Statements']
  };
  
  const documents = fallbackMappings[category] || ['Bank Statements', 'Business Tax Returns', 'Financial Statements'];
  console.log(`🔄 [FALLBACK] Providing ${documents.length} fallback documents for category "${category}": [${documents.join(', ')}]`);
  
  return documents;
}

/**
 * Helper function to validate that all lender products have required document fields
 */
export async function validateLenderProductDocumentFields(): Promise<{
  totalProducts: number;
  productsWithDocuments: number;
  missingDocumentFields: string[];
  sampleDocumentField: string;
}> {
  try {
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!data.success || !data.products) {
      throw new Error('Failed to fetch products');
    }
    
    const products = data.products;
    const totalProducts = products.length;
    
    let productsWithDocuments = 0;
    let sampleDocumentField = '';
    const missingDocumentFields: string[] = [];
    
    products.forEach((product: LenderProduct, index: number) => {
      const hasDocuments = !!(
        product.doc_requirements ||
        product.documentRequirements ||
        product.requiredDocuments ||
        product.required_documents
      );
      
      if (hasDocuments) {
        productsWithDocuments++;
        if (!sampleDocumentField) {
          if (product.doc_requirements) sampleDocumentField = 'doc_requirements';
          else if (product.documentRequirements) sampleDocumentField = 'documentRequirements';
          else if (product.requiredDocuments) sampleDocumentField = 'requiredDocuments';
          else if (product.required_documents) sampleDocumentField = 'required_documents';
        }
      } else {
        missingDocumentFields.push(`${product.name} (${product.lender_name})`);
      }
    });
    
    return {
      totalProducts,
      productsWithDocuments,
      missingDocumentFields,
      sampleDocumentField
    };
    
  } catch (error) {
    console.error('❌ Error validating document fields:', error);
    return {
      totalProducts: 0,
      productsWithDocuments: 0,
      missingDocumentFields: [],
      sampleDocumentField: 'unknown'
    };
  }
}