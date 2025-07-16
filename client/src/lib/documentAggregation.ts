/**
 * Document Aggregation Logic for Step 5
 * Implements union of all required documents across eligible lender products
 * Based on ChatGPT team specifications
 */

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
  
  console.log(`📋 [AGGREGATION] Starting document aggregation for:`, {
    selectedCategory,
    selectedCountry,
    requestedAmount
  });
  
  try {
    // Fetch all lender products from staff API
    const response = await fetch('/api/public/lenders');
    
    if (!response.ok) {
      throw new Error(`Staff API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.products || !Array.isArray(data.products)) {
      throw new Error('Invalid API response format');
    }
    
    const allProducts = data.products;
    console.log(`📦 [AGGREGATION] Loaded ${allProducts.length} total products from staff API`);
    
    // Normalize country format
    const normalizedCountry = selectedCountry === 'canada' || selectedCountry === 'Canada' ? 'CA' :
                             selectedCountry === 'united-states' || selectedCountry === 'United States' ? 'US' :
                             selectedCountry;
    
    console.log(`🌍 [AGGREGATION] Normalized country: ${selectedCountry} → ${normalizedCountry}`);
    
    // ✅ STEP 1: Filter all local lender products that match criteria
    const eligibleProducts = allProducts.filter(product => {
      // Category match
      const categoryMatch = product.category === selectedCategory;
      
      // Country match
      const countryMatch = product.country === normalizedCountry;
      
      // Amount range match
      const minAmount = product.min_amount || product.amountMin || 0;
      const maxAmount = product.max_amount || product.amountMax || Number.MAX_SAFE_INTEGER;
      const amountMatch = minAmount <= requestedAmount && maxAmount >= requestedAmount;
      
      const isEligible = categoryMatch && countryMatch && amountMatch;
      
      if (isEligible) {
        console.log(`✅ [AGGREGATION] Eligible: ${product.name} (${product.lender_name})`);
        console.log(`   Category: ${product.category}, Country: ${product.country}, Range: $${minAmount.toLocaleString()}-$${maxAmount.toLocaleString()}`);
      }
      
      return isEligible;
    });
    
    console.log(`🎯 [AGGREGATION] Found ${eligibleProducts.length} eligible products`);
    
    if (eligibleProducts.length === 0) {
      return {
        eligibleProducts: [],
        requiredDocuments: [],
        message: `No lenders match your criteria: ${selectedCategory} in ${selectedCountry} for $${requestedAmount.toLocaleString()}`,
        hasMatches: false
      };
    }
    
    // ✅ STEP 2: Aggregate and deduplicate required documents (UNION)
    const allDocumentLists = eligibleProducts.map(product => {
      // Try multiple field names for document requirements
      const docs = product.doc_requirements || 
                   product.documentRequirements || 
                   product.requiredDocuments || 
                   product.required_documents || 
                   [];
      
      console.log(`📝 [AGGREGATION] ${product.name}: [${docs.join(', ')}]`);
      return docs;
    });
    
    // Create union of all required documents (deduplicated)
    const requiredDocuments = Array.from(
      new Set(allDocumentLists.flatMap(docs => docs))
    );
    
    console.log(`🎯 [AGGREGATION] Final aggregated documents (${requiredDocuments.length}): [${requiredDocuments.join(', ')}]`);
    
    // Document name transformation for consistency
    const transformedDocuments = requiredDocuments.map(docName => {
      if (docName === 'Financial Statements') {
        return 'Accountant Prepared Financial Statements';
      }
      return docName;
    });
    
    return {
      eligibleProducts,
      requiredDocuments: transformedDocuments,
      message: `Documents required across ${eligibleProducts.length} eligible ${selectedCategory} lenders`,
      hasMatches: true
    };
    
  } catch (error) {
    console.error('❌ [AGGREGATION] Error calculating document requirements:', error);
    return {
      eligibleProducts: [],
      requiredDocuments: [],
      message: `Error fetching document requirements: ${error.message}`,
      hasMatches: false
    };
  }
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