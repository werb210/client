/**
 * Document Intersection Logic for Step 5
 * Uses local cache to avoid API calls during application process
 */

interface LenderProduct {
  id: string;
  name: string;
  lender_name: string;
  category: string;
  country: string;
  min_amount: number;
  max_amount: number;
  required_documents: string[];
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
): Promise<DocumentIntersectionResult> { /* ensure products fetched */ 
  
  try {

    // B. Use local cache - first try localStorage, then API if cache empty
    let allLenders: LenderProduct[] = [];
    
    // Try localStorage cache first
    const cacheKey = 'bf:products:v1';
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const products = parsed.data || parsed;
        if (Array.isArray(products) && products.length > 0) {
          allLenders = products;
          console.log(`📦 [Step5] Using ${allLenders.length} products from localStorage cache`);
        }
      } catch (error) {
        console.warn('Cache parse error:', error);
      }
    }
    
    // If cache empty, fetch once and cache
    if (allLenders.length === 0) {
      console.log('📡 [Step5] Cache empty, fetching products once...');
      const response = await fetch('/api/v1/products');
      
      if (!response.ok) {
        return {
          eligibleLenders: [],
          requiredDocuments: [],
          message: "Unable to load lender products. Please try again later.",
          hasMatches: false
        };
      }
      
      const products = await response.json();
      allLenders = Array.isArray(products) ? products : [];
      
      // Cache for future use
      localStorage.setItem(cacheKey, JSON.stringify({ 
        at: Date.now(), 
        source: 'api', 
        data: allLenders 
      }));
      console.log(`💾 [Step5] Cached ${allLenders.length} products for future use`);
    }
    
    if (allLenders.length === 0) {
      return {
        eligibleLenders: [],
        requiredDocuments: [],
        message: "No lender products available.",
        hasMatches: false
      };
    }

    // Map business location to country code
    const countryCode = businessLocation === 'united-states' ? 'US' : 
                       businessLocation === 'canada' ? 'CA' : 
                       businessLocation;

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
      const minAmount = product.min_amount || 0;
      const maxAmount = product.max_amount || Number.MAX_SAFE_INTEGER;
      const amountMatch = minAmount <= fundingAmount && maxAmount >= fundingAmount;

      // Product filtering logic applied
      
      return categoryMatch && countryMatch && amountMatch;
    });

    // Eligible lenders identified

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
    
    // Document lists extracted from each lender

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

    // Document intersection calculation complete

    // Handle case where no documents are common to all lenders
    if (requiredDocuments.length === 0) {
      // Provide fallback documents for Business Line of Credit if no intersection found
      // No intersection found, using fallback documents
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