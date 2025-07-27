#!/usr/bin/env tsx

/**
 * 🔒 DOCUMENT ENUM VALIDATION SCRIPT
 * Validates document enum consistency across client/staff apps
 * Run: npm run validate:enums
 * CI/CD Integration: Exit code 1 on validation failure
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  enumCount: number;
  lastUpdated?: string;
}

// Canonical document enum list (locked version)
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

const CANONICAL_COUNT = CANONICAL_DOCUMENT_ENUMS.length; // 22

/**
 * Validate client document categories file
 */
function validateClientDocumentCategories(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    enumCount: 0
  };

  const clientCategoriesPath = join(process.cwd(), 'client/src/lib/documentCategories.ts');
  
  if (!existsSync(clientCategoriesPath)) {
    result.valid = false;
    result.errors.push('❌ Client documentCategories.ts file not found');
    return result;
  }

  try {
    const content = readFileSync(clientCategoriesPath, 'utf-8');
    
    // Extract DOCUMENT_CATEGORIES array
    const categoryMatches = content.match(/export const DOCUMENT_CATEGORIES = \[([\s\S]*?)\];/);
    if (!categoryMatches) {
      result.valid = false;
      result.errors.push('❌ DOCUMENT_CATEGORIES export not found in client file');
      return result;
    }

    // Extract all value fields
    const valueMatches = content.match(/value: '([^']+)'/g);
    if (!valueMatches) {
      result.valid = false;
      result.errors.push('❌ No document category values found');
      return result;
    }

    const extractedValues = valueMatches.map(match => match.match(/value: '([^']+)'/)?.[1]).filter(Boolean);
    result.enumCount = extractedValues.length;

    // Validate count
    if (result.enumCount !== CANONICAL_COUNT) {
      result.valid = false;
      result.errors.push(`❌ Expected ${CANONICAL_COUNT} document categories, found ${result.enumCount}`);
    }

    // Validate each enum exists
    for (const canonicalEnum of CANONICAL_DOCUMENT_ENUMS) {
      if (!extractedValues.includes(canonicalEnum)) {
        result.valid = false;
        result.errors.push(`❌ Missing required enum: ${canonicalEnum}`);
      }
    }

    // Check for unexpected enums
    for (const extractedValue of extractedValues) {
      if (!CANONICAL_DOCUMENT_ENUMS.includes(extractedValue as any)) {
        result.warnings.push(`⚠️  Unexpected enum found: ${extractedValue}`);
      }
    }

    // Extract last updated date
    const dateMatch = content.match(/Date: (.+)/);
    if (dateMatch) {
      result.lastUpdated = dateMatch[1].trim();
    }

  } catch (error) {
    result.valid = false;
    result.errors.push(`❌ Error reading client file: ${error.message}`);
  }

  return result;
}

/**
 * Validate document mapping consistency
 */
function validateDocumentMapping(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    enumCount: 0
  };

  const mappingPath = join(process.cwd(), 'client/src/lib/docNormalization.ts');
  
  if (!existsSync(mappingPath)) {
    result.valid = false;
    result.errors.push('❌ Document mapping file not found');
    return result;
  }

  try {
    const content = readFileSync(mappingPath, 'utf-8');
    
    // Check for all canonical enums in mapping
    for (const canonicalEnum of CANONICAL_DOCUMENT_ENUMS) {
      if (!content.includes(`'${canonicalEnum}':`)) {
        result.warnings.push(`⚠️  Canonical enum ${canonicalEnum} not found in mapping`);
      }
    }

    // Check for updated enum mappings (critical fixes)
    const criticalMappings = [
      "'financial_statements': 'accountant_financials'",
      "'profit_loss_statement': 'profit_and_loss'",
      "'personal_financial_statement': 'personal_financials'",
      "'void_pad': 'void_cheque'"
    ];

    for (const mapping of criticalMappings) {
      if (!content.includes(mapping)) {
        result.warnings.push(`⚠️  Legacy mapping missing: ${mapping}`);
      }
    }

  } catch (error) {
    result.valid = false;
    result.errors.push(`❌ Error reading mapping file: ${error.message}`);
  }

  return result;
}

/**
 * Validate shared document types
 */
function validateSharedDocumentTypes(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    enumCount: 0
  };

  const sharedPath = join(process.cwd(), 'shared/documentTypes.ts');
  
  if (!existsSync(sharedPath)) {
    result.valid = false;
    result.errors.push('❌ Shared documentTypes.ts file not found');
    return result;
  }

  try {
    const content = readFileSync(sharedPath, 'utf-8');
    
    // Check SUPPORTED_DOCUMENT_TYPES array
    const supportedMatch = content.match(/export const SUPPORTED_DOCUMENT_TYPES = \[([\s\S]*?)\] as const;/);
    if (!supportedMatch) {
      result.valid = false;
      result.errors.push('❌ SUPPORTED_DOCUMENT_TYPES not found in shared file');
      return result;
    }

    // Extract enum values
    const enumMatches = supportedMatch[1].match(/'([^']+)'/g);
    if (enumMatches) {
      const extractedEnums = enumMatches.map(match => match.replace(/'/g, ''));
      result.enumCount = extractedEnums.length;

      // Validate against canonical list
      for (const canonicalEnum of CANONICAL_DOCUMENT_ENUMS) {
        if (!extractedEnums.includes(canonicalEnum)) {
          result.valid = false;
          result.errors.push(`❌ Missing enum in shared types: ${canonicalEnum}`);
        }
      }
    }

  } catch (error) {
    result.valid = false;
    result.errors.push(`❌ Error reading shared file: ${error.message}`);
  }

  return result;
}

/**
 * Main validation function
 */
async function validateDocumentEnums(): Promise<void> {
  console.log('🔒 DOCUMENT ENUM VALIDATION STARTING...');
  console.log('=' .repeat(60));
  console.log(`📋 Canonical Document Enums: ${CANONICAL_COUNT} types`);
  console.log('🎯 Validating consistency across client/staff apps...\n');

  // Run all validations
  const clientResult = validateClientDocumentCategories();
  const mappingResult = validateDocumentMapping();
  const sharedResult = validateSharedDocumentTypes();

  let overallValid = true;
  let totalErrors = 0;
  let totalWarnings = 0;

  // Report client validation
  console.log('📱 CLIENT VALIDATION:');
  console.log('-'.repeat(20));
  if (clientResult.valid) {
    console.log(`✅ Client documentCategories.ts: ${clientResult.enumCount}/${CANONICAL_COUNT} enums valid`);
    if (clientResult.lastUpdated) {
      console.log(`📅 Last updated: ${clientResult.lastUpdated}`);
    }
  } else {
    console.log('❌ Client validation FAILED');
    overallValid = false;
  }
  
  clientResult.errors.forEach(error => console.log(`   ${error}`));
  clientResult.warnings.forEach(warning => console.log(`   ${warning}`));
  totalErrors += clientResult.errors.length;
  totalWarnings += clientResult.warnings.length;

  // Report mapping validation
  console.log('\n🔄 MAPPING VALIDATION:');
  console.log('-'.repeat(20));
  if (mappingResult.valid) {
    console.log('✅ Document mapping consistency verified');
  } else {
    console.log('❌ Mapping validation FAILED');
    overallValid = false;
  }
  
  mappingResult.errors.forEach(error => console.log(`   ${error}`));
  mappingResult.warnings.forEach(warning => console.log(`   ${warning}`));
  totalErrors += mappingResult.errors.length;
  totalWarnings += mappingResult.warnings.length;

  // Report shared validation
  console.log('\n🔗 SHARED TYPES VALIDATION:');
  console.log('-'.repeat(25));
  if (sharedResult.valid) {
    console.log(`✅ Shared documentTypes.ts: ${sharedResult.enumCount} enums found`);
  } else {
    console.log('❌ Shared types validation FAILED');
    overallValid = false;
  }
  
  sharedResult.errors.forEach(error => console.log(`   ${error}`));
  sharedResult.warnings.forEach(warning => console.log(`   ${warning}`));
  totalErrors += sharedResult.errors.length;
  totalWarnings += sharedResult.warnings.length;

  // Final summary
  console.log('\n📊 VALIDATION SUMMARY:');
  console.log('=' .repeat(30));
  console.log(`📋 Total Errors: ${totalErrors}`);
  console.log(`⚠️  Total Warnings: ${totalWarnings}`);
  
  if (overallValid && totalErrors === 0) {
    console.log('🎉 ALL VALIDATIONS PASSED');
    console.log('✅ Document enum system is consistent and locked');
    process.exit(0);
  } else {
    console.log('💥 VALIDATION FAILED');
    console.log('❌ Document enum inconsistencies detected');
    console.log('\n🔧 ACTION REQUIRED:');
    console.log('1. Fix all reported errors');
    console.log('2. Re-run validation: npm run validate:enums');
    console.log('3. Update documentation if enums changed');
    process.exit(1);
  }
}

// Execute validation when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateDocumentEnums().catch(error => {
    console.error('💥 Validation script failed:', error);
    process.exit(1);
  });
}

export { validateDocumentEnums, CANONICAL_DOCUMENT_ENUMS };