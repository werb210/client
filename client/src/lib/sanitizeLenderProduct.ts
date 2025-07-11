/**
 * Lender Product Sanitization Utility
 * Auto-fixes and normalizes malformed lender product data
 */

export interface SanitizationLog {
  productId: string;
  productName: string;
  field: string;
  originalValue: any;
  sanitizedValue: any;
  action: string;
}

/**
 * Sanitizes and normalizes a lender product
 */
export function sanitizeLenderProduct(product: any): { sanitized: any; logs: SanitizationLog[] } {
  const logs: SanitizationLog[] = [];
  const sanitized = { ...product };
  
  const log = (field: string, originalValue: any, sanitizedValue: any, action: string) => {
    logs.push({
      productId: product.id || 'unknown',
      productName: product.name || 'Unknown Product',
      field,
      originalValue,
      sanitizedValue,
      action
    });
  };
  
  // 1. Normalize category field
  if (sanitized.category && typeof sanitized.category === 'string') {
    const originalCategory = sanitized.category;
    const normalizedCategory = sanitized.category
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    if (normalizedCategory !== originalCategory) {
      sanitized.category = normalizedCategory;
      log('category', originalCategory, normalizedCategory, 'Normalized category format');
    }
  } else if (!sanitized.category) {
    sanitized.category = 'unknown';
    log('category', undefined, 'unknown', 'Added missing category');
  }
  
  // 2. Convert amount fields to numbers
  ['minAmount', 'maxAmount', 'interestRateMin', 'interestRateMax', 'termMin', 'termMax'].forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string' && !isNaN(Number(sanitized[field]))) {
      const originalValue = sanitized[field];
      sanitized[field] = Number(sanitized[field]);
      log(field, originalValue, sanitized[field], 'Converted string to number');
    } else if (sanitized[field] === null || sanitized[field] === undefined) {
      sanitized[field] = 0;
      log(field, sanitized[field], 0, 'Added default value for missing numeric field');
    }
  });
  
  // 3. Normalize geography field
  if (sanitized.geography) {
    if (typeof sanitized.geography === 'string') {
      const originalGeography = sanitized.geography;
      sanitized.geography = [sanitized.geography];
      log('geography', originalGeography, sanitized.geography, 'Converted string geography to array');
    }
  } else if (sanitized.country) {
    sanitized.geography = [sanitized.country];
    log('geography', undefined, sanitized.geography, 'Created geography array from country field');
  } else {
    sanitized.geography = ['US'];
    log('geography', undefined, ['US'], 'Added default geography');
  }
  
  // 4. Ensure required string fields
  ['id', 'name', 'lender', 'product'].forEach(field => {
    if (!sanitized[field] || typeof sanitized[field] !== 'string') {
      const originalValue = sanitized[field];
      sanitized[field] = `unknown_${field}`;
      log(field, originalValue, sanitized[field], 'Added default string value');
    }
  });
  
  // 5. Normalize required documents
  if (!sanitized.requiredDocuments) {
    sanitized.requiredDocuments = [];
    log('requiredDocuments', undefined, [], 'Added empty required documents array');
  } else if (typeof sanitized.requiredDocuments === 'string') {
    const originalValue = sanitized.requiredDocuments;
    sanitized.requiredDocuments = [sanitized.requiredDocuments];
    log('requiredDocuments', originalValue, sanitized.requiredDocuments, 'Converted string to array');
  }
  
  // 6. Add missing description
  if (!sanitized.description) {
    sanitized.description = `${sanitized.category || 'Financial'} product from ${sanitized.lender || 'Unknown Lender'}`;
    log('description', undefined, sanitized.description, 'Generated default description');
  }
  
  // 7. Normalize industry field
  if (sanitized.industry && typeof sanitized.industry === 'string') {
    const originalIndustry = sanitized.industry;
    const normalizedIndustry = sanitized.industry.toLowerCase().replace(/\s+/g, '_');
    if (normalizedIndustry !== originalIndustry) {
      sanitized.industry = normalizedIndustry;
      log('industry', originalIndustry, normalizedIndustry, 'Normalized industry format');
    }
  } else if (!sanitized.industry) {
    sanitized.industry = 'general';
    log('industry', undefined, 'general', 'Added default industry');
  }
  
  return { sanitized, logs };
}

/**
 * Sanitizes an array of lender products and logs all changes
 */
export function sanitizeLenderProducts(products: any[]): { sanitized: any[]; allLogs: SanitizationLog[] } {
  const sanitized: any[] = [];
  const allLogs: SanitizationLog[] = [];
  
  console.log(`[SANITIZER] Starting sanitization of ${products.length} products`);
  
  products.forEach((product, index) => {
    const { sanitized: sanitizedProduct, logs } = sanitizeLenderProduct(product);
    sanitized.push(sanitizedProduct);
    allLogs.push(...logs);
    
    if (logs.length > 0) {
      console.log(`[SANITIZER] Product ${index + 1} (${product.name || 'Unknown'}): ${logs.length} fixes applied`);
      logs.forEach(log => {
        console.log(`  ✅ ${log.action}: ${log.field} (${log.originalValue} → ${log.sanitizedValue})`);
      });
    }
  });
  
  console.log(`[SANITIZER] Completed: ${allLogs.length} total fixes across ${products.length} products`);
  
  return { sanitized, allLogs };
}