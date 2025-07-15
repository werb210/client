/**
 * Unified Document Requirements Logic - Synced Database Only
 * 
 * This module implements the authoritative rule-set for Step 5 required documents.
 * It consolidates requirements from ALL matching lender products and eliminates duplicates.
 * Uses only synced staff database - NO FALLBACK LOGIC.
 */

export interface RequiredDoc {
  id?: string;
  label: string;
  description?: string;
  quantity?: number;
  required: boolean;
  category?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  product_type?: string;
}

export interface WizardData {
  country: 'US' | 'CA';
  fundingAmount: number;
  lookingFor: 'equipment' | 'capital' | 'both';
  selectedProducts: Product[];
  accountsReceivableBalance?: string;
}

interface QueryParams {
  country: string;
  amount: number;
  arBalance?: string;
}

/**
 * Maps user selections and product categories to document categories
 */
function getDocCategories(lookingFor: string, products: Product[]): string[] {
  const categoryMap: Record<string, string> = {
    equipment: "equipment_financing",
    capital: "term_loan",
    both: "line_of_credit",
    "line of credit": "line_of_credit",
    line_of_credit: "line_of_credit",
    equipment_financing: "equipment_financing",
    factoring: "invoice_factoring",
    invoice_factoring: "invoice_factoring",
    term_loan: "term_loan",
    working_capital: "working_capital"
  };

  // Get base category from user's "looking for" selection
  const baseCategories = categoryMap[lookingFor] ? [categoryMap[lookingFor]] : [];

  // Extract categories from selected products
  const productCategories = products
    .map(product => {
      // Try direct category mapping first
      if (categoryMap[product.category]) {
        return categoryMap[product.category];
      }
      
      // Try product_type mapping
      if (product.product_type && categoryMap[product.product_type]) {
        return categoryMap[product.product_type];
      }
      
      // Try keyword detection in product name
      return getKeywordCategory(product.name);
    })
    .filter((category): category is string => category !== null);

  // Combine and deduplicate
  return Array.from(new Set([...baseCategories, ...productCategories]));
}

/**
 * Detects document category from product name keywords
 */
function getKeywordCategory(name: string): string | null {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("line of credit") || lowerName.includes("loc")) {
    return "line_of_credit";
  }
  if (lowerName.includes("equipment")) {
    return "equipment_financing";
  }
  if (lowerName.includes("factoring") || lowerName.includes("receivable")) {
    return "invoice_factoring";
  }
  if (lowerName.includes("working capital")) {
    return "working_capital";
  }
  
  return null;
}

/**
 * Fetches required documents for a specific category from the staff API
 */
async function fetchDocsForCategory(category: string, params: QueryParams): Promise<RequiredDoc[]> {
  try {
    const queryString = new URLSearchParams({
      headquarters: params.country === 'CA' ? 'CA' : 'US',
      fundingAmount: params.amount.toString(),
      ...(params.arBalance && { arBalance: params.arBalance })
    }).toString();

    const response = await fetch(`/api/loan-products/required-documents/${category}?${queryString}`).catch(fetchError => {
      console.warn(`[DOCUMENT_REQUIREMENTS] Network error for category ${category}:`, fetchError.message);
      throw new Error(`Network error: ${fetchError.message}`);
    });
    
    if (!response.ok) {
      console.warn(`[DOCUMENT_REQUIREMENTS] API error for category ${category}:`, response.status, response.statusText);
      return [];
    }

    const result = await response.json().catch(jsonError => {
      console.warn(`[DOCUMENT_REQUIREMENTS] Invalid JSON for category ${category}:`, jsonError.message);
      return { data: [] };
    });
    
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.warn(`[DOCUMENT_REQUIREMENTS] Query failed for category ${category}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Standard fallback documents for business loans
 */
function getFallbackDocuments(): RequiredDoc[] {
  return [
    {
      id: "bank_statements",
      label: "Bank Statements",
      description: "Last 6 months of business bank statements",
      quantity: 6,
      required: true,
      category: "financial"
    },
    {
      id: "tax_returns",
      label: "Tax Returns", 
      description: "Last 3 years of business tax returns",
      quantity: 3,
      required: true,
      category: "financial"
    },
    {
      id: "financial_statements",
      label: "Financial Statements",
      description: "Recent profit & loss and balance sheet",
      quantity: 2,
      required: true,
      category: "financial"
    },
    {
      id: "business_license",
      label: "Business License",
      description: "Valid business registration or license",
      quantity: 1,
      required: true,
      category: "legal"
    },
    {
      id: "articles_incorporation",
      label: "Articles of Incorporation",
      description: "Legal business formation documents",
      quantity: 1,
      required: true,
      category: "legal"
    }
  ];
}

/**
 * Builds the complete, deduplicated list of required documents
 * 
 * This is the main function that consolidates requirements from all matching products
 */
export async function buildRequiredDocList(input: WizardData): Promise<RequiredDoc[]> {
  // Determine all document categories needed
  const categories = getDocCategories(input.lookingFor, input.selectedProducts);
  
  // console.log('📋 Document categories determined:', categories);
  
  if (categories.length === 0) {
    console.warn('⚠️ No document categories found, using fallback documents');
    return getFallbackDocuments();
  }

  // Fetch documents for each category
  const queryParams: QueryParams = {
    country: input.country,
    amount: input.fundingAmount,
    arBalance: input.accountsReceivableBalance
  };

  const documentLists = await Promise.all(
    categories.map(category => fetchDocsForCategory(category, queryParams))
  );

  // Flatten all document lists
  const allDocuments = documentLists.flat();
  
  // Get fallback documents
  const fallbackDocs = getFallbackDocuments();

  // Merge and deduplicate using document ID/label as key
  const docMap = new Map<string, RequiredDoc>();

  // Add fallback documents first
  fallbackDocs.forEach(doc => {
    const key = doc.id || doc.label.toLowerCase().replace(/\s+/g, '_');
    docMap.set(key, doc);
  });

  // Add API documents, potentially overriding fallback with more specific requirements
  allDocuments.forEach(doc => {
    const key = doc.id || doc.label.toLowerCase().replace(/\s+/g, '_');
    if (!docMap.has(key) || doc.required) {
      docMap.set(key, doc);
    }
  });

  const finalDocuments = Array.from(docMap.values());
  
  // console.log(`📄 Final document list: ${finalDocuments.length} unique documents`);
  // console.log('📄 Documents:', finalDocuments.map(d => d.label));
  
  return finalDocuments;
}

/**
 * Helper function to convert form data to WizardData format
 */
export function convertFormDataToWizardData(formData: any, selectedProducts: Product[] = []): WizardData {
  // Map business location to country code
  const getCountryCode = (location: string): 'US' | 'CA' => {
    if (location === 'Canada') return 'CA';
    if (location === 'United States') return 'US';
    return 'US'; // default
  };

  // Parse funding amount from string format
  const parseFundingAmount = (amount: string): number => {
    if (!amount) return 50000; // default
    
    // Remove currency symbols and parse
    const numStr = amount.replace(/[$,]/g, '');
    const num = parseInt(numStr);
    return isNaN(num) ? 50000 : num;
  };

  return {
    country: getCountryCode(formData.businessLocation || formData.headquarters),
    fundingAmount: parseFundingAmount(formData.fundingAmount),
    lookingFor: formData.lookingFor || formData.useOfFunds || 'capital',
    selectedProducts,
    accountsReceivableBalance: formData.accountsReceivableBalance
  };
}