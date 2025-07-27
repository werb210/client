/**
 * 🔒 SERVER-SIDE DOCUMENT VALIDATION GUARD
 * Prevents invalid document types from reaching database
 * Implements server-side validation barriers per user requirements
 */

// Server-side canonical document enum list (must match client)
const CANONICAL_DOCUMENT_ENUMS = [
  'accounts_payable',
  'accounts_receivable', 
  'articles_of_incorporation',
  'balance_sheet',
  'bank_statements',
  'business_license',
  'business_plan',
  'cash_flow_statement',
  'collateral_docs',
  'drivers_license_front_back',
  'equipment_quote',
  'accountant_financials',
  'invoice_samples',
  'other',
  'personal_financials',
  'personal_guarantee',
  'profit_and_loss',
  'proof_of_identity',
  'signed_application',
  'supplier_agreement',
  'tax_returns',
  'void_cheque'
] as const;

type CanonicalDocumentEnum = typeof CANONICAL_DOCUMENT_ENUMS[number];

interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedType?: string;
  alertRaised?: boolean;
}

/**
 * Server API validation middleware
 */
export function validateDocumentTypeMiddleware(documentType: string): ValidationResult {
  if (!documentType || typeof documentType !== 'string') {
    const error = 'DocumentType is required';
    raiseServerAlert('MISSING_DOCUMENT_TYPE', '', error);
    return {
      valid: false,
      error,
      alertRaised: true
    };
  }

  const sanitized = documentType.toLowerCase().trim();
  
  if (!CANONICAL_DOCUMENT_ENUMS.includes(sanitized as CanonicalDocumentEnum)) {
    const error = `Invalid documentType: "${documentType}". Must be one of: ${CANONICAL_DOCUMENT_ENUMS.join(', ')}`;
    raiseServerAlert('INVALID_DOCUMENT_TYPE', documentType, error);
    return {
      valid: false,
      error,
      alertRaised: true
    };
  }

  return {
    valid: true,
    sanitizedType: sanitized
  };
}

/**
 * Database layer validation (final barrier)
 */
export function validateDocumentTypeForDatabase(documentType: string): ValidationResult {
  const apiValidation = validateDocumentTypeMiddleware(documentType);
  
  if (!apiValidation.valid) {
    return apiValidation;
  }

  const dbSafeType = apiValidation.sanitizedType!;
  
  // SQL injection protection
  if (dbSafeType.match(/['";\\]/)) {
    const error = 'Document type contains invalid characters';
    raiseServerAlert('SQL_INJECTION_ATTEMPT', documentType, error);
    return {
      valid: false,
      error,
      alertRaised: true
    };
  }

  // Final enum validation
  if (!CANONICAL_DOCUMENT_ENUMS.includes(dbSafeType as CanonicalDocumentEnum)) {
    const error = 'Final database validation failed - enum not in canonical list';
    raiseServerAlert('DB_ENUM_VALIDATION_FAILED', documentType, error);
    return {
      valid: false,
      error,
      alertRaised: true
    };
  }

  return {
    valid: true,
    sanitizedType: dbSafeType
  };
}

/**
 * Server-side alert system
 */
function raiseServerAlert(alertType: string, documentType: string, error: string): void {
  const alert = {
    timestamp: new Date().toISOString(),
    type: alertType,
    documentType,
    error,
    severity: 'HIGH',
    source: 'SERVER_VALIDATION_GUARD',
    action: 'Request blocked - invalid document type'
  };

  // Log error
  console.error('🚨 [SERVER-ALERT] Document validation failed:', alert);

  // In production, send to monitoring system
  try {
    // For development, write to file system
    const fs = await import('fs');
    const path = await import('path');
    
    const alertsFile = path.join(process.cwd(), '.server-document-alerts.json');
    let alerts: any[] = [];
    
    try {
      if (fs.existsSync(alertsFile)) {
        alerts = JSON.parse(fs.readFileSync(alertsFile, 'utf-8'));
      }
    } catch (readError) {
      console.warn('Could not read existing alerts file');
    }
    
    alerts.push(alert);
    
    // Keep only last 100 alerts
    if (alerts.length > 100) {
      alerts.splice(0, alerts.length - 100);
    }
    
    fs.writeFileSync(alertsFile, JSON.stringify(alerts, null, 2));
    
  } catch (error) {
    console.error('Failed to log server alert:', error);
  }
}

/**
 * Express middleware function
 */
export function documentTypeValidationMiddleware(req: any, res: any, next: any): void {
  // Check if request contains document type
  const documentType = req.body?.documentType || req.query?.documentType;
  
  if (!documentType) {
    // If no document type, skip validation (might be non-document endpoint)
    return next();
  }

  const validation = validateDocumentTypeMiddleware(documentType);
  
  if (!validation.valid) {
    return res.status(400).json({
      error: validation.error,
      code: 'INVALID_DOCUMENT_TYPE',
      allowedTypes: CANONICAL_DOCUMENT_ENUMS,
      timestamp: new Date().toISOString()
    });
  }

  // Add sanitized type to request for downstream use
  req.sanitizedDocumentType = validation.sanitizedType;
  next();
}

/**
 * Health check for document validation system
 */
export function getDocumentValidationStatus(): {
  status: 'healthy' | 'warning' | 'error';
  enumCount: number;
  lastValidated: string;
  alerts: number;
} {
  const status = {
    status: 'healthy' as const,
    enumCount: CANONICAL_DOCUMENT_ENUMS.length,
    lastValidated: new Date().toISOString(),
    alerts: 0
  };

  // Check for recent alerts
  try {
    const fs = await import('fs');
    const path = await import('path');
    const alertsFile = path.join(process.cwd(), '.server-document-alerts.json');
    
    if (fs.existsSync(alertsFile)) {
      const alerts = JSON.parse(fs.readFileSync(alertsFile, 'utf-8'));
      const recentAlerts = alerts.filter((alert: any) => {
        const alertTime = new Date(alert.timestamp);
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return alertTime > hourAgo;
      });
      
      status.alerts = recentAlerts.length;
      
      if (recentAlerts.length > 10) {
        status.status = 'error';
      } else if (recentAlerts.length > 5) {
        status.status = 'warning';
      }
    }
  } catch (error) {
    console.warn('Could not check alert status:', error);
    status.status = 'warning';
  }

  return status;
}

export { CANONICAL_DOCUMENT_ENUMS };