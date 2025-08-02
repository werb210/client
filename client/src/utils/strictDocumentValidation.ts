interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'completed' | 'uploading' | 'error' | 'fallback';
  documentType: string;
  file?: File;
}

interface StrictValidationResult {
  isValid: boolean;
  canProceed: boolean;
  errors: string[];
  warnings: string[];
  accountantDocsCount: number;
  taxDocsCount: number;
  requiredAccountantDocs: number;
  requiredTaxDocs: number;
}

/**
 * Strict Document Validation for Step 5
 * Enforces exactly 3 accountant documents and 3 tax return documents
 */
export function validateStrictDocumentRequirements(uploadedFiles: UploadedFile[]): StrictValidationResult {
  const result: StrictValidationResult = {
    isValid: false,
    canProceed: false,
    errors: [],
    warnings: [],
    accountantDocsCount: 0,
    taxDocsCount: 0,
    requiredAccountantDocs: 3,
    requiredTaxDocs: 3
  };

  // Only count successfully uploaded files
  const successfulUploads = uploadedFiles.filter(file => file.status === 'completed');

  // Define accountant document types
  const accountantDocTypes = [
    'accountant_prepared_financial_statements',
    'financial_statements',
    'accountant_financial_statements',
    'accountant_prepared_statements'
  ];

  // Define tax document types  
  const taxDocTypes = [
    'tax_returns',
    'business_tax_returns',
    'personal_tax_returns',
    'tax_return',
    'corporate_tax_returns'
  ];

  // Count documents by category
  successfulUploads.forEach(file => {
    const docType = file.documentType?.toLowerCase() || '';
    
    if (accountantDocTypes.some(type => docType.includes(type) || type.includes(docType))) {
      result.accountantDocsCount++;
    }
    
    if (taxDocTypes.some(type => docType.includes(type) || type.includes(docType))) {
      result.taxDocsCount++;
    }
  });

  // Validate accountant documents
  if (result.accountantDocsCount < result.requiredAccountantDocs) {
    const missing = result.requiredAccountantDocs - result.accountantDocsCount;
    result.errors.push(`Missing ${missing} accountant prepared financial statements (${result.accountantDocsCount}/${result.requiredAccountantDocs} uploaded)`);
  } else if (result.accountantDocsCount > result.requiredAccountantDocs) {
    const extra = result.accountantDocsCount - result.requiredAccountantDocs;
    result.warnings.push(`You have uploaded ${extra} extra accountant documents. Only ${result.requiredAccountantDocs} are required.`);
  }

  // Validate tax documents
  if (result.taxDocsCount < result.requiredTaxDocs) {
    const missing = result.requiredTaxDocs - result.taxDocsCount;
    result.errors.push(`Missing ${missing} tax return documents (${result.taxDocsCount}/${result.requiredTaxDocs} uploaded)`);
  } else if (result.taxDocsCount > result.requiredTaxDocs) {
    const extra = result.taxDocsCount - result.requiredTaxDocs;
    result.warnings.push(`You have uploaded ${extra} extra tax documents. Only ${result.requiredTaxDocs} are required.`);
  }

  // Check for general file upload issues
  const failedUploads = uploadedFiles.filter(file => file.status === 'error');
  if (failedUploads.length > 0) {
    result.errors.push(`${failedUploads.length} files failed to upload. Please try uploading them again.`);
  }

  // Determine if validation passes
  result.isValid = result.accountantDocsCount === result.requiredAccountantDocs && 
                   result.taxDocsCount === result.requiredTaxDocs;
                   
  result.canProceed = result.isValid && failedUploads.length === 0;

  return result;
}

/**
 * Get user-friendly document type display names
 */
export function getDocumentTypeDisplayName(documentType: string): string {
  const displayNames: Record<string, string> = {
    'accountant_prepared_financial_statements': 'Accountant Prepared Financial Statements',
    'financial_statements': 'Financial Statements', 
    'accountant_financial_statements': 'Accountant Financial Statements',
    'accountant_prepared_statements': 'Accountant Prepared Statements',
    'tax_returns': 'Tax Returns',
    'business_tax_returns': 'Business Tax Returns', 
    'personal_tax_returns': 'Personal Tax Returns',
    'tax_return': 'Tax Return',
    'corporate_tax_returns': 'Corporate Tax Returns',
    'bank_statements': 'Bank Statements',
    'business_license': 'Business License',
    'personal_financial_statement': 'Personal Financial Statement'
  };

  return displayNames[documentType] || documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Generate progress summary for document requirements
 */
export function generateDocumentProgressSummary(validation: StrictValidationResult): string {
  const accountantProgress = `${validation.accountantDocsCount}/${validation.requiredAccountantDocs}`;
  const taxProgress = `${validation.taxDocsCount}/${validation.requiredTaxDocs}`;
  
  return `Accountant Documents: ${accountantProgress} | Tax Documents: ${taxProgress}`;
}