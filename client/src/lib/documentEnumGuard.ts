/**
 * 🔒 DOCUMENT ENUM GUARD SYSTEM
 * Prevents submission of unsupported documentType at UI, API, and DB layers
 * Implements validation barriers per user requirements
 */

import { DOCUMENT_CATEGORIES } from './documentCategories';

// Extract valid enum values
const VALID_DOCUMENT_ENUMS = DOCUMENT_CATEGORIES.map(cat => cat.value);

/**
 * UI Layer Validation Guard
 * Prevents invalid document types from being submitted through UI
 */
export function validateDocumentTypeForUI(documentType: string): {
  valid: boolean;
  error?: string;
  correctedType?: string;
} {
  if (!documentType || typeof documentType !== 'string') {
    return {
      valid: false,
      error: 'Document type is required'
    };
  }

  const normalizedType = documentType.toLowerCase().trim();
  
  // Check against valid enums
  if (!VALID_DOCUMENT_ENUMS.includes(normalizedType)) {
    // Try to find closest match
    const closestMatch = findClosestDocumentType(normalizedType);
    
    return {
      valid: false,
      error: `Invalid document type: "${documentType}". Please select from dropdown.`,
      correctedType: closestMatch
    };
  }

  return { valid: true };
}

/**
 * API Layer Validation Guard
 * Validates document types before API submission
 */
export function validateDocumentTypeForAPI(documentType: string): {
  valid: boolean;
  error?: string;
  sanitizedType?: string;
} {
  if (!documentType) {
    return {
      valid: false,
      error: 'DocumentType is required for API submission'
    };
  }

  const sanitized = documentType.toLowerCase().trim();
  
  if (!VALID_DOCUMENT_ENUMS.includes(sanitized)) {
    console.error(`❌ [API-GUARD] Invalid documentType blocked: "${documentType}"`);
    console.error(`❌ [API-GUARD] Valid types:`, VALID_DOCUMENT_ENUMS);
    
    return {
      valid: false,
      error: `Invalid documentType: "${documentType}". Must be one of: ${VALID_DOCUMENT_ENUMS.join(', ')}`
    };
  }

  return {
    valid: true,
    sanitizedType: sanitized
  };
}

/**
 * Database Layer Validation Guard
 * Final validation before database storage
 */
export function validateDocumentTypeForDB(documentType: string): {
  valid: boolean;
  error?: string;
  dbSafeType?: string;
} {
  const apiValidation = validateDocumentTypeForAPI(documentType);
  
  if (!apiValidation.valid) {
    return {
      valid: false,
      error: `DB validation failed: ${apiValidation.error}`
    };
  }

  // Additional DB-specific validation
  const dbSafeType = apiValidation.sanitizedType!;
  
  // Check for SQL injection patterns
  if (dbSafeType.includes("'") || dbSafeType.includes('"') || dbSafeType.includes(';')) {
    return {
      valid: false,
      error: 'Invalid characters in document type'
    };
  }

  return {
    valid: true,
    dbSafeType
  };
}

/**
 * Find closest matching document type for user assistance
 */
function findClosestDocumentType(input: string): string | undefined {
  const inputLower = input.toLowerCase();
  
  // Direct substring matches
  for (const validType of VALID_DOCUMENT_ENUMS) {
    if (validType.includes(inputLower) || inputLower.includes(validType)) {
      return validType;
    }
  }

  // Common mapping corrections
  const corrections: Record<string, string> = {
    'financial': 'accountant_financials',
    'profit': 'profit_and_loss',
    'pnl': 'profit_and_loss',
    'p&l': 'profit_and_loss',
    'void': 'void_cheque',
    'check': 'void_cheque',
    'personal': 'personal_financials',
    'bank': 'bank_statements',
    'tax': 'tax_returns',
    'license': 'business_license',
    'plan': 'business_plan'
  };

  for (const [key, value] of Object.entries(corrections)) {
    if (inputLower.includes(key)) {
      return value;
    }
  }

  return undefined;
}

/**
 * Comprehensive validation for upload forms
 */
export function validateUploadForm(data: {
  documentType?: string;
  file?: File;
  applicationId?: string;
}): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate document type
  if (!data.documentType) {
    errors.push('Document type is required');
  } else {
    const typeValidation = validateDocumentTypeForUI(data.documentType);
    if (!typeValidation.valid) {
      errors.push(typeValidation.error!);
      if (typeValidation.correctedType) {
        warnings.push(`Did you mean "${typeValidation.correctedType}"?`);
      }
    }
  }

  // Validate file
  if (!data.file) {
    errors.push('File is required');
  } else {
    if (data.file.size === 0) {
      errors.push('File cannot be empty');
    }
    if (data.file.size > 25 * 1024 * 1024) {
      errors.push('File size cannot exceed 25MB');
    }
  }

  // Validate application ID
  if (!data.applicationId) {
    errors.push('Application ID is required');
  } else {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(data.applicationId) && !data.applicationId.startsWith('app_')) {
      warnings.push('Application ID format may be invalid');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Alert system for validation failures
 */
export function raiseDocumentTypeAlert(validationError: {
  type: 'UI' | 'API' | 'DB';
  documentType: string;
  error: string;
  timestamp?: string;
}): void {
  const alert = {
    ...validationError,
    timestamp: validationError.timestamp || new Date().toISOString(),
    severity: 'HIGH',
    action: 'Document type validation failed - submission blocked'
  };

  // Log to console for development
  console.error('🚨 DOCUMENT TYPE VALIDATION ALERT:', alert);

  // In production, this would send to monitoring system
  try {
    // Store alert in localStorage for debugging
    const alerts = JSON.parse(localStorage.getItem('documentTypeAlerts') || '[]');
    alerts.push(alert);
    
    // Keep only last 50 alerts
    if (alerts.length > 50) {
      alerts.splice(0, alerts.length - 50);
    }
    
    localStorage.setItem('documentTypeAlerts', JSON.stringify(alerts));
  } catch (error) {
    console.warn('Failed to store document type alert:', error);
  }
}

// Export valid enums for reference
export { VALID_DOCUMENT_ENUMS };