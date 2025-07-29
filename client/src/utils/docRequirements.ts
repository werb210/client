/**
 * Document requirements utility for /upload-documents page
 * Simplified approach based on application financing category
 */

export interface RequiredDocumentType {
  type: string;
  category: string;
  label: string;
  required: number;
  description?: string;
}

/**
 * Get required document types from application data
 * Uses simplified category-based approach for reliability
 */
export function getRequiredDocumentTypes(application: any): RequiredDocumentType[] {
  if (!application) {
    console.log('📋 [docRequirements] No application data provided');
    return [];
  }

  console.log('📋 [docRequirements] Getting document requirements for application:', application.id);
  console.log('📋 [docRequirements] Application full data:', application);

  // Extract financing category from application with better parsing
  let category = 'working_capital'; // default
  
  if (application.form_data?.step1?.productCategory) {
    category = application.form_data.step1.productCategory;
  } else if (application.category) {
    category = application.category;
  } else if (application.financingType) {
    category = application.financingType;
  }

  console.log('📋 [docRequirements] Determined category:', category);

  // Get document requirements by category
  const requiredDocs = getDocumentRequirementsByCategory(category);

  console.log(`📋 [docRequirements] Found ${requiredDocs.length} required document types:`, 
    requiredDocs.map(d => `${d.label} (${d.required})`));

  return requiredDocs;
}

/**
 * Get document requirements for a specific financing category
 */
export function getDocumentRequirementsByCategory(category: string): RequiredDocumentType[] {
  // Normalize category name
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '_');
  
  // Common document requirements by category
  const categoryRequirements: Record<string, RequiredDocumentType[]> = {
    'working_capital': [
      { type: 'bank_statements', category: 'banking', label: 'Bank Statements', required: 6 },
      { type: 'financial_statements', category: 'financial', label: 'Financial Statements', required: 1 },
      { type: 'tax_returns', category: 'tax', label: 'Business Tax Returns', required: 3 }
    ],
    'equipment_financing': [
      { type: 'equipment_quote', category: 'equipment', label: 'Equipment Quote', required: 1 },
      { type: 'bank_statements', category: 'banking', label: 'Bank Statements', required: 6 },
      { type: 'financial_statements', category: 'financial', label: 'Financial Statements', required: 1 }
    ],
    'term_loan': [
      { type: 'bank_statements', category: 'banking', label: 'Bank Statements', required: 6 },
      { type: 'financial_statements', category: 'financial', label: 'Financial Statements', required: 1 },
      { type: 'tax_returns', category: 'tax', label: 'Business Tax Returns', required: 3 },
      { type: 'drivers_license_front_back', category: 'identity', label: 'ID Documents', required: 1 }
    ],
    'line_of_credit': [
      { type: 'bank_statements', category: 'banking', label: 'Bank Statements', required: 3 },
      { type: 'financial_statements', category: 'financial', label: 'Financial Statements', required: 1 }
    ],
    'invoice_factoring': [
      { type: 'accounts_receivable_aging', category: 'financial', label: 'Accounts Receivable Aging', required: 1 },
      { type: 'bank_statements', category: 'banking', label: 'Bank Statements', required: 3 },
      { type: 'financial_statements', category: 'financial', label: 'Financial Statements', required: 1 }
    ]
  };

  // Return requirements for the category, or default working capital requirements
  const requirements = categoryRequirements[normalizedCategory] || [
    { type: 'bank_statements', category: 'banking', label: 'Bank Statements', required: 6 },
    { type: 'financial_statements', category: 'financial', label: 'Financial Statements', required: 1 },
    { type: 'tax_returns', category: 'tax', label: 'Business Tax Returns', required: 3 }
  ];
  
  console.log(`📋 [getDocumentRequirementsByCategory] Category "${category}" → "${normalizedCategory}" has ${requirements.length} requirements`);
  
  return requirements;
}