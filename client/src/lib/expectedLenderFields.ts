/**
 * Expected Lender Product Field Schema
 * Defines the required fields and their types for lender products
 */

export const expectedLenderFields = {
  id: 'string',
  name: 'string',
  category: 'string',
  minAmount: 'number',
  maxAmount: 'number',
  geography: 'object', // Can be string or array
  country: 'string',
  lender: 'string',
  product: 'string',
  productCategory: 'string',
  description: 'string',
  terms: 'string',
  interestRateMin: 'number',
  interestRateMax: 'number',
  termMin: 'number',
  termMax: 'number',
  industry: 'string',
  requiredDocuments: 'object', // Can be array or object
} as const;

export type ExpectedLenderField = keyof typeof expectedLenderFields;

export interface FieldMismatch {
  productId: string;
  productName: string;
  field: string;
  expectedType: string;
  actualType: string;
  actualValue: any;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface ProductDiagnostic {
  productId: string;
  productName: string;
  totalFields: number;
  missingFields: string[];
  mismatchedFields: FieldMismatch[];
  score: number; // 0-100 based on field completeness
  status: 'healthy' | 'warning' | 'error';
}

/**
 * Validates a lender product against the expected schema
 */
export function validateLenderProduct(product: any): ProductDiagnostic {
  const mismatches: FieldMismatch[] = [];
  const missingFields: string[] = [];
  
  for (const [field, expectedType] of Object.entries(expectedLenderFields)) {
    const actualValue = product[field];
    const actualType = actualValue === null || actualValue === undefined ? 'undefined' : typeof actualValue;
    
    if (actualValue === null || actualValue === undefined) {
      missingFields.push(field);
      continue;
    }
    
    // Special handling for flexible types
    if (field === 'geography' && (actualType === 'string' || Array.isArray(actualValue))) {
      continue; // Valid for geography
    }
    
    if (field === 'requiredDocuments' && (Array.isArray(actualValue) || actualType === 'object')) {
      continue; // Valid for requiredDocuments
    }
    
    // Handle numeric fields that might be strings
    if (expectedType === 'number' && actualType === 'string' && !isNaN(Number(actualValue))) {
      mismatches.push({
        productId: product.id || 'unknown',
        productName: product.name || 'Unknown Product',
        field,
        expectedType,
        actualType,
        actualValue,
        severity: 'warning',
        suggestion: `Convert string "${actualValue}" to number ${Number(actualValue)}`
      });
      continue;
    }
    
    // Strict type checking
    if (actualType !== expectedType) {
      mismatches.push({
        productId: product.id || 'unknown',
        productName: product.name || 'Unknown Product',
        field,
        expectedType,
        actualType,
        actualValue,
        severity: actualType === 'undefined' ? 'error' : 'warning'
      });
    }
  }
  
  // Calculate health score
  const totalExpectedFields = Object.keys(expectedLenderFields).length;
  const healthyFields = totalExpectedFields - missingFields.length - mismatches.filter(m => m.severity === 'error').length;
  const score = Math.round((healthyFields / totalExpectedFields) * 100);
  
  // Determine status
  let status: 'healthy' | 'warning' | 'error' = 'healthy';
  if (missingFields.length > 3 || mismatches.filter(m => m.severity === 'error').length > 0) {
    status = 'error';
  } else if (missingFields.length > 0 || mismatches.length > 0) {
    status = 'warning';
  }
  
  return {
    productId: product.id || 'unknown',
    productName: product.name || 'Unknown Product',
    totalFields: Object.keys(product).length,
    missingFields,
    mismatchedFields: mismatches,
    score,
    status
  };
}