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
  
  console.log(`🔧 [INTERSECTION] ===== STARTING NEW TEST =====`);
  console.log(`🔧 [INTERSECTION] Called with:`, {
    selectedProductType,
    businessLocation,
    fundingAmount
  });
  console.log(`🔧 [INTERSECTION] Parameter types:`, {
    selectedProductType: typeof selectedProductType,
    businessLocation: typeof businessLocation,
    fundingAmount: typeof fundingAmount
  });
  
  try {
    console.log('🔍 [INTERSECTION] Starting document requirements calculation...');
    console.log('Parameters:', { selectedProductType, businessLocation, fundingAmount });

    // B. Use local cached lender products (as designed - no API calls needed)
    let allLenders: LenderProduct[] = [];
    
    try {
      console.log(`📦 [INTERSECTION] Loading from staff API...`);
      const response = await fetch('/api/public/lenders');
      
      if (!response.ok) {
        throw new Error(`Staff API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.products && Array.isArray(data.products)) {
        allLenders = data.products;
        console.log(`✅ [INTERSECTION] Loaded ${allLenders.length} products from staff API`);
        
        // Check for equipment financing products specifically
        const equipmentProducts = allLenders.filter(p => 
          p.category === 'Equipment Financing' || 
          p.category === 'Equipment Finance'
        );
        console.log(`🏗️ [INTERSECTION] Equipment financing products found: ${equipmentProducts.length}`);
        
        const canadianEquipment = equipmentProducts.filter(p => p.country === 'CA');
        console.log(`🇨🇦 [INTERSECTION] Canadian equipment products: ${canadianEquipment.length}`);
      } else {
        console.log(`❌ [INTERSECTION] Invalid API response format:`, data);
        throw new Error('Invalid API response format');
      }
    } catch (apiError) {
      console.log(`❌ [INTERSECTION] API access failed:`, apiError);
      throw new Error(`Staff API unavailable: ${apiError.message}`);
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
      // Category match - normalize both to compare properly
      const productCategory = product.category?.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
      const searchCategory = selectedProductType?.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
      
      // Also try direct string match and title case conversion
      const directMatch = product.category?.toLowerCase() === selectedProductType?.toLowerCase();
      const normalizedMatch = productCategory === searchCategory;
      
      // Convert search term to title case for DB comparison (working_capital -> Working Capital)
      const titleCaseSearch = selectedProductType?.split(/[_\s-]/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      const titleCaseMatch = product.category === titleCaseSearch;
      
      const categoryMatch = directMatch || normalizedMatch || titleCaseMatch;
      
      // Country match
      const countryMatch = product.country === countryCode;
      
      // Amount range match - handle undefined/null amounts gracefully
      const minAmount = product.amountMin || 0;
      const maxAmount = product.amountMax || Number.MAX_SAFE_INTEGER;
      const amountMatch = minAmount <= fundingAmount && maxAmount >= fundingAmount;

      console.log(`🔍 [INTERSECTION] ${product.name} (${product.lenderName}): category="${product.category}"→"${productCategory}" vs "${searchCategory}" (titleCase: "${titleCaseSearch}") = ${categoryMatch}, country="${product.country}" vs "${countryCode}" = ${countryMatch}, amount=${minAmount}-${maxAmount} vs ${fundingAmount} = ${amountMatch}`);
      
      return categoryMatch && countryMatch && amountMatch;
    });

    console.log(`✅ [INTERSECTION] Found ${eligibleLenders.length} eligible lenders:`);
    eligibleLenders.forEach(lender => {
      const docs = lender.doc_requirements || 
                   lender.documentRequirements || 
                   lender.requiredDocuments || 
                   lender.required_documents || 
                   [];
      console.log(`   - ${lender.lender_name || lender.lenderName}: ${lender.name} (${docs.length} docs)`);
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

    // Document name transformation function
    const transformDocumentName = (docName: string): string => {
      if (docName === 'Financial Statements') {
        return 'Accountant Prepared Financial Statements';
      }
      return docName;
    };

    // D. Extract required documents across all matches with name transformation
    // Try multiple field names for document requirements
    const allRequiredDocs = eligibleLenders.map(product => {
      const docs = product.doc_requirements || 
                   product.documentRequirements || 
                   product.requiredDocuments || 
                   product.required_documents || 
                   [];
      return docs.map(transformDocumentName);
    });
    
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
      // Provide fallback documents for Business Line of Credit if no intersection found
      console.log('🔄 [INTERSECTION] No intersection found, using fallback documents for Business Line of Credit');
      const fallbackDocuments = [
        'Bank Statements',
        'Tax Returns', 
        'Accountant Prepared Financial Statements'
      ];
      
      return {
        eligibleLenders,
        requiredDocuments: fallbackDocuments,
        message: `Using standard document requirements for Business Line of Credit (no specific intersection found)`,
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