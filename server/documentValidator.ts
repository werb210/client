import crypto from 'crypto';
import { Buffer } from 'buffer';

export interface DocumentValidationResult {
  isValid: boolean;
  validationStatus: 'authentic' | 'placeholder' | 'suspicious' | 'invalid';
  contentLength: number;
  checksumSHA256: string;
  filename: string;
  category: string;
  errors: string[];
  metadata: {
    uploadedBy: string;
    uploadedAt: string;
    validatedAt: string;
    originalSize: number;
    processedSize: number;
  };
}

export class DocumentValidator {
  private static readonly MIN_FILE_SIZE = 5120; // 5KB minimum
  private static readonly MAX_FILE_SIZE = 104857600; // 100MB maximum
  private static readonly PLACEHOLDER_INDICATORS = [
    'sample', 'example', 'test', 'placeholder', 'demo', 'template',
    'dummy', 'fake', 'mock', 'specimen', 'draft'
  ];

  static validateDocument(
    fileName: string, 
    fileData: string, 
    category: string, 
    uploadedBy: string = 'user'
  ): DocumentValidationResult {
    const errors: string[] = [];
    let validationStatus: DocumentValidationResult['validationStatus'] = 'authentic';

    // Decode base64 to get actual file size
    const buffer = Buffer.from(fileData, 'base64');
    const actualSize = buffer.length;
    const base64Size = fileData.length;

    // Generate SHA256 checksum
    const checksumSHA256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // File size validation
    if (actualSize < this.MIN_FILE_SIZE) {
      errors.push(`File too small: ${actualSize} bytes (minimum ${this.MIN_FILE_SIZE} bytes)`);
      validationStatus = 'invalid';
    }

    if (actualSize > this.MAX_FILE_SIZE) {
      errors.push(`File too large: ${actualSize} bytes (maximum ${this.MAX_FILE_SIZE} bytes)`);
      validationStatus = 'invalid';
    }

    // Placeholder content detection
    const lowerFileName = fileName.toLowerCase();
    const hasPlaceholderIndicator = this.PLACEHOLDER_INDICATORS.some(indicator => 
      lowerFileName.includes(indicator)
    );

    if (hasPlaceholderIndicator) {
      errors.push('Filename contains placeholder indicators');
      validationStatus = 'placeholder';
    }

    // Content authenticity checks
    if (actualSize < 10240 && !hasPlaceholderIndicator) { // Under 10KB but not flagged as placeholder
      validationStatus = 'suspicious';
      errors.push('File size unusually small for business document');
    }

    // Category-specific validation
    const categoryValidation = this.validateDocumentCategory(fileName, category, actualSize);
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors);
      if (validationStatus === 'authentic') {
        validationStatus = categoryValidation.suggestedStatus;
      }
    }

    return {
      isValid: errors.length === 0 && validationStatus === 'authentic',
      validationStatus,
      contentLength: actualSize,
      checksumSHA256,
      filename: fileName,
      category,
      errors,
      metadata: {
        uploadedBy,
        uploadedAt: new Date().toISOString(),
        validatedAt: new Date().toISOString(),
        originalSize: base64Size,
        processedSize: actualSize
      }
    };
  }

  private static validateDocumentCategory(
    fileName: string, 
    category: string, 
    fileSize: number
  ): { isValid: boolean; errors: string[]; suggestedStatus: DocumentValidationResult['validationStatus'] } {
    const errors: string[] = [];
    let suggestedStatus: DocumentValidationResult['validationStatus'] = 'authentic';

    const expectedExtensions: Record<string, string[]> = {
      'bank_statements': ['.pdf', '.png', '.jpg', '.jpeg'],
      'tax_returns': ['.pdf'],
      'financial_statements': ['.pdf', '.xlsx', '.xls'],
      'business_license': ['.pdf', '.png', '.jpg', '.jpeg'],
      'accounts_receivable': ['.pdf', '.xlsx', '.csv'],
      'accounts_payable': ['.pdf', '.xlsx', '.csv'],
      'income_statement': ['.pdf', '.xlsx', '.xls'],
      'balance_sheet': ['.pdf', '.xlsx', '.xls'],
      'cash_flow_statement': ['.pdf', '.xlsx', '.xls']
    };

    const minSizesByCategory: Record<string, number> = {
      'bank_statements': 50000,  // 50KB - bank statements are typically substantial
      'tax_returns': 100000,     // 100KB - tax returns are comprehensive documents
      'financial_statements': 30000, // 30KB - financial statements vary
      'business_license': 20000,  // 20KB - licenses can be simple
      'accounts_receivable': 10000, // 10KB - AR reports vary
      'accounts_payable': 10000,   // 10KB - AP reports vary
      'income_statement': 25000,   // 25KB - income statements are detailed
      'balance_sheet': 25000,      // 25KB - balance sheets are detailed
      'cash_flow_statement': 25000 // 25KB - cash flow statements are detailed
    };

    // Check file extension
    const expectedExts = expectedExtensions[category];
    if (expectedExts) {
      const hasValidExtension = expectedExts.some(ext => 
        fileName.toLowerCase().endsWith(ext)
      );
      if (!hasValidExtension) {
        errors.push(`Invalid file type for ${category}. Expected: ${expectedExts.join(', ')}`);
        suggestedStatus = 'suspicious';
      }
    }

    // Check category-specific minimum size
    const minSize = minSizesByCategory[category];
    if (minSize && fileSize < minSize) {
      errors.push(`File size too small for ${category} (${fileSize} bytes < ${minSize} bytes)`);
      suggestedStatus = 'suspicious';
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestedStatus
    };
  }

  // Validate a set of documents together
  static validateDocumentSet(documents: Array<{
    fileName: string;
    fileData: string;
    category: string;
  }>): {
    isValid: boolean;
    results: DocumentValidationResult[];
    summary: {
      totalDocuments: number;
      validDocuments: number;
      placeholderDocuments: number;
      suspiciousDocuments: number;
      invalidDocuments: number;
    };
  } {
    const results = documents.map(doc => 
      this.validateDocument(doc.fileName, doc.fileData, doc.category)
    );

    const summary = {
      totalDocuments: documents.length,
      validDocuments: results.filter(r => r.validationStatus === 'authentic').length,
      placeholderDocuments: results.filter(r => r.validationStatus === 'placeholder').length,
      suspiciousDocuments: results.filter(r => r.validationStatus === 'suspicious').length,
      invalidDocuments: results.filter(r => r.validationStatus === 'invalid').length
    };

    const isValid = summary.placeholderDocuments === 0 && summary.invalidDocuments === 0;

    return { isValid, results, summary };
  }

  // Generate validation metadata for API transmission
  static generateValidationMetadata(results: DocumentValidationResult[]): any {
    return {
      documentValidation: {
        totalDocuments: results.length,
        validationResults: results.map(r => ({
          filename: r.filename,
          category: r.category,
          status: r.validationStatus,
          checksum: r.checksumSHA256,
          size: r.contentLength
        })),
        validationTimestamp: new Date().toISOString(),
        validationVersion: '2.0'
      }
    };
  }

  // Security validation for sensitive document types
  static validateSensitiveDocument(fileName: string, fileData: string, category: string): {
    requiresManualReview: boolean;
    securityFlags: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const securityFlags: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    const buffer = Buffer.from(fileData, 'base64');
    const actualSize = buffer.length;
    
    // Check for unusually small files that might be placeholders
    if (actualSize < 20480) { // Under 20KB
      securityFlags.push('Unusually small file size for business document');
      riskLevel = 'medium';
    }
    
    // Check for common placeholder patterns in filename
    const suspiciousPatterns = ['temp', 'copy', 'untitled', 'new', 'document'];
    if (suspiciousPatterns.some(pattern => fileName.toLowerCase().includes(pattern))) {
      securityFlags.push('Filename suggests temporary or placeholder document');
      riskLevel = 'medium';
    }
    
    // High-value document categories require additional scrutiny
    const highValueCategories = ['tax_returns', 'bank_statements', 'financial_statements'];
    if (highValueCategories.includes(category) && securityFlags.length > 0) {
      riskLevel = 'high';
    }
    
    return {
      requiresManualReview: riskLevel === 'high',
      securityFlags,
      riskLevel
    };
  }
}