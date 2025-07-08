/**
 * Document Intersection Logic for Step 5
 * Implements client-side filtering and document intersection as specified
 */

interface LenderProduct {
  id: string;
  name: string;
  lenderName: string;
  category: string;
  country: string;
  amountMin: number;
  amountMax: number;
  requiredDocuments: string[];
}

interface DocumentIntersectionResult {
  eligibleLenders: LenderProduct[];
  requiredDocuments: string[];
  message: string;
  hasMatches: boolean;
}

/**
 * Get document requirements using intersection logic
 */
export async function getDocumentRequirementsIntersection(
  selectedProductType: string,
  businessLocation: string,
  fundingAmount: number
): Promise<DocumentIntersectionResult> {
  
  try {
    console.log('🔍 [INTERSECTION] Starting document requirements calculation...');
    console.log('Parameters:', { selectedProductType, businessLocation, fundingAmount });

    // B. Fetch all lender products - try API first, then fallback to cache
    let allLenders: LenderProduct[] = [];
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/lenders`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.products) {
          allLenders = data.products;
          console.log(`📦 [INTERSECTION] Fetched ${allLenders.length} products from API`);
        }
      }
    } catch (apiError) {
      console.log(`⚠️ [INTERSECTION] API failed, trying cache: ${apiError.message}`);
    }
    
    // Fallback to IndexedDB cache if API fails
    if (allLenders.length === 0) {
      try {
        const { get } = await import('idb-keyval');
        const cachedProducts = await get('lender_products_cache');
        if (cachedProducts && Array.isArray(cachedProducts)) {
          allLenders = cachedProducts;
          console.log(`📦 [INTERSECTION] Using cached ${allLenders.length} products`);
        }
      } catch (cacheError) {
        console.log(`❌ [INTERSECTION] Cache failed: ${cacheError.message}`);
        throw new Error('Unable to fetch lender products from API or cache');
      }
    }
    
    if (allLenders.length === 0) {
      throw new Error('No lender products available');
    }
    console.log(`📦 [INTERSECTION] Fetched ${allLenders.length} total products`);

    // Map business location to country code
    const countryCode = businessLocation === 'united-states' ? 'US' : 
                       businessLocation === 'canada' ? 'CA' : 
                       businessLocation;

    console.log(`🌍 [INTERSECTION] Mapping location: ${businessLocation} → ${countryCode}`);

    // C. Filter matching products
    const eligibleLenders = allLenders.filter(product => {
      // Category match - handle multiple formats (working_capital, Working Capital, etc.)
      const productCategory = product.category?.toLowerCase().replace(/\s+/g, '_');
      const searchCategory = selectedProductType?.toLowerCase().replace(/\s+/g, '_');
      const categoryMatch = productCategory === searchCategory || 
                           product.category?.toLowerCase() === selectedProductType?.toLowerCase();
      
      // Country match
      const countryMatch = product.country === countryCode;
      
      // Amount range match
      const amountMatch = product.amountMin <= fundingAmount && product.amountMax >= fundingAmount;

      console.log(`🔍 [INTERSECTION] ${product.name} (${product.lenderName}): category="${product.category}"→"${productCategory}" vs "${searchCategory}" = ${categoryMatch}, country="${product.country}" vs "${countryCode}" = ${countryMatch}, amount=${product.amountMin}-${product.amountMax} vs ${fundingAmount} = ${amountMatch}`);
      
      return categoryMatch && countryMatch && amountMatch;
    });

    console.log(`✅ [INTERSECTION] Found ${eligibleLenders.length} eligible lenders:`);
    eligibleLenders.forEach(lender => {
      console.log(`   - ${lender.lenderName}: ${lender.name} (${lender.requiredDocuments?.length || 0} docs)`);
    });

    // Handle no matches
    if (eligibleLenders.length === 0) {
      return {
        eligibleLenders: [],
        requiredDocuments: [],
        message: `No lenders match your criteria: ${selectedProductType} in ${businessLocation} for $${fundingAmount.toLocaleString()}`,
        hasMatches: false
      };
    }

    // D. Extract required documents across all matches
    const allRequiredDocs = eligibleLenders.map(product => product.requiredDocuments || []);
    
    console.log('📋 [INTERSECTION] Document lists from each lender:');
    allRequiredDocs.forEach((docs, index) => {
      console.log(`   ${eligibleLenders[index].lenderName}: [${docs.join(', ')}]`);
    });

    // Compute intersection of all sets
    if (allRequiredDocs.length === 0) {
      return {
        eligibleLenders,
        requiredDocuments: [],
        message: 'No document requirements found for matching lenders',
        hasMatches: true
      };
    }

    // Start with first lender's documents, then filter to intersection
    let requiredDocuments = allRequiredDocs[0] || [];
    
    for (let i = 1; i < allRequiredDocs.length; i++) {
      requiredDocuments = requiredDocuments.filter(doc => 
        allRequiredDocs[i].includes(doc)
      );
    }

    console.log(`🎯 [INTERSECTION] Final document intersection: [${requiredDocuments.join(', ')}]`);

    // Handle case where no documents are common to all lenders
    if (requiredDocuments.length === 0) {
      return {
        eligibleLenders,
        requiredDocuments: [],
        message: `No documents are required by all ${eligibleLenders.length} matching lenders. Consider reviewing individual lender requirements.`,
        hasMatches: true
      };
    }

    return {
      eligibleLenders,
      requiredDocuments,
      message: `Documents required by all ${eligibleLenders.length} matching lenders`,
      hasMatches: true
    };

  } catch (error) {
    console.error('❌ [INTERSECTION] Error calculating document requirements:', error);
    return {
      eligibleLenders: [],
      requiredDocuments: [],
      message: `Error fetching document requirements: ${error.message}`,
      hasMatches: false
    };
  }
}

/**
 * Helper function to format category names for API calls
 */
export function mapCategoryToAPIFormat(category: string): string {
  const categoryMap: Record<string, string> = {
    'Working Capital': 'working_capital',
    'Business Line of Credit': 'line_of_credit', 
    'Term Loan': 'term_loan',
    'Equipment Financing': 'equipment_financing',
    'Invoice Factoring': 'invoice_factoring',
    'Asset-Based Lending': 'asset_based_lending',
    'Purchase Order Financing': 'purchase_order_financing'
  };
  
  return categoryMap[category] || category.toLowerCase().replace(/\s+/g, '_');
}