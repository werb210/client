#!/usr/bin/env ts-node

/**
 * Build-time Document Type Mapping Validation
 * Ensures all document types map to valid backend enums
 * Prevents deployment of broken mappings
 */

import { SUPPORTED_DOCUMENT_TYPES } from '../shared/documentTypes';
import { mapToBackendDocumentType } from '../client/src/lib/docNormalization';

// All client-side document types that must be mappable
const ALL_CLIENT_DOCUMENT_TYPES = [
  // Official backend types (must map to themselves)
  ...SUPPORTED_DOCUMENT_TYPES,
  
  // Client-side variations (must map to valid backend types)
  'bank_statement',
  'banking_statements',
  'bank_account_statements',
  'account_prepared_financials',
  'accountant_prepared_financials', 
  'accountant_prepared_statements',
  'accountant_prepared_financial_statements',
  'audited_financial_statements',
  'audited_financials',
  'compiled_financial_statements',
  'pnl_statement',
  'p&l_statement',
  'income_statement',
  'profit_and_loss_statement',
  'tax_return',
  'business_tax_returns',
  'corporate_tax_returns',
  'void_cheque',
  'void_check',
  'voided_check',
  'cancelled_check',
  'banking_info',
  'bank_verification',
  'driver_license',
  'drivers_license',
  'driving_license',
  'id_verification',
  'government_id',
  'invoice_summary',
  'invoices',
  'sample_invoices',
  'customer_invoices',
  'ar_report',
  'receivables',
  'ar_aging',
  'accounts_receivable_aging',
  'ap_report',
  'payables',
  'ap_aging',
  'accounts_payable_aging',
  'equipment_invoice',
  'equipment_specifications',
  'operating_license',
  'professional_license',
  'incorporation_documents',
  'corporate_formation_documents',
  'personal_financial_statements',
  'personal_balance_sheet',
  'collateral_documents',
  'security_documents',
  'identity_verification',
  'id_documents',
  'supplier_contracts',
  'vendor_agreements',
  'business_plans',
  'financial_projections',
  'personal_guarantees',
  'guarantee_documents',
  'completed_application',
  'loan_application',
] as const;

interface ValidationResult {
  clientType: string;
  mappedType?: string;
  isValid: boolean;
  error?: string;
}

function validateDocumentTypeMappings(): ValidationResult[] {
  console.log('🔍 Starting document type mapping validation...');
  console.log(`📋 Validating ${ALL_CLIENT_DOCUMENT_TYPES.length} client document types`);
  console.log(`🎯 Against ${SUPPORTED_DOCUMENT_TYPES.length} supported backend types`);
  console.log('');

  const results: ValidationResult[] = [];
  let passCount = 0;
  let failCount = 0;

  for (const clientType of ALL_CLIENT_DOCUMENT_TYPES) {
    try {
      const mappedType = mapToBackendDocumentType(clientType);
      
      // Check if mapped type is undefined or empty
      if (!mappedType || mappedType.trim() === '') {
        results.push({
          clientType,
          mappedType,
          isValid: false,
          error: 'Mapping returned empty/undefined result'
        });
        failCount++;
        continue;
      }

      // Check if mapped type is in the allowed backend list
      const isValidBackend = SUPPORTED_DOCUMENT_TYPES.includes(mappedType as any);
      
      if (isValidBackend) {
        results.push({
          clientType,
          mappedType,
          isValid: true
        });
        passCount++;
        console.log(`✅ ${clientType} → ${mappedType}`);
      } else {
        results.push({
          clientType,
          mappedType,
          isValid: false,
          error: `Mapped type '${mappedType}' not in SUPPORTED_DOCUMENT_TYPES`
        });
        failCount++;
        console.error(`❌ ${clientType} → ${mappedType} (INVALID BACKEND TYPE)`);
      }

    } catch (error) {
      results.push({
        clientType,
        mappedType: undefined,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown mapping error'
      });
      failCount++;
      console.error(`❌ ${clientType} → ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('');
  console.log('📊 VALIDATION RESULTS:');
  console.log(`✅ Passed: ${passCount}/${ALL_CLIENT_DOCUMENT_TYPES.length}`);
  console.log(`❌ Failed: ${failCount}/${ALL_CLIENT_DOCUMENT_TYPES.length}`);
  console.log(`🎯 Success Rate: ${Math.round((passCount / ALL_CLIENT_DOCUMENT_TYPES.length) * 100)}%`);

  return results;
}

function validateCriticalMappings(): boolean {
  console.log('');
  console.log('🎯 VALIDATING CRITICAL MAPPINGS:');
  
  const criticalMappings = {
    'account_prepared_financials': 'financial_statements',
    'pnl_statement': 'profit_loss_statement',
    'void_cheque': 'void_pad',
    'government_id': 'drivers_license_front_back',
    'invoice_summary': 'invoice_samples',
    'ar_report': 'accounts_receivable',
    'ap_report': 'accounts_payable',
  };

  let criticalPassed = 0;
  let criticalFailed = 0;

  for (const [clientType, expectedBackend] of Object.entries(criticalMappings)) {
    try {
      const actualMapped = mapToBackendDocumentType(clientType);
      
      if (actualMapped === expectedBackend) {
        console.log(`✅ CRITICAL: ${clientType} → ${expectedBackend}`);
        criticalPassed++;
      } else {
        console.error(`❌ CRITICAL: ${clientType} → ${actualMapped} (expected: ${expectedBackend})`);
        criticalFailed++;
      }
    } catch (error) {
      console.error(`❌ CRITICAL: ${clientType} → ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      criticalFailed++;
    }
  }

  console.log(`🎯 Critical mappings: ${criticalPassed}/${Object.keys(criticalMappings).length} passed`);
  return criticalFailed === 0;
}

function main(): void {
  console.log('🚀 BUILD-TIME DOCUMENT TYPE MAPPING VALIDATION');
  console.log('='.repeat(60));
  
  const results = validateDocumentTypeMappings();
  const criticalMappingsValid = validateCriticalMappings();
  
  const failedResults = results.filter(r => !r.isValid);
  
  if (failedResults.length > 0) {
    console.log('');
    console.log('🚨 FAILED MAPPINGS:');
    failedResults.forEach(result => {
      console.error(`  ❌ ${result.clientType}: ${result.error}`);
    });
  }

  if (!criticalMappingsValid) {
    console.log('');
    console.error('🚨 CRITICAL MAPPINGS FAILED - These are required for core functionality');
  }

  console.log('');
  console.log('='.repeat(60));

  if (failedResults.length === 0 && criticalMappingsValid) {
    console.log('🎉 ALL VALIDATIONS PASSED - Build can proceed');
    process.exit(0);
  } else {
    console.error('💥 VALIDATION FAILED - Build must be stopped');
    console.error('');
    console.error('To fix:');
    console.error('1. Add missing mappings to DOCUMENT_TYPE_MAP in client/src/lib/docNormalization.ts');
    console.error('2. Ensure all mapped types exist in SUPPORTED_DOCUMENT_TYPES in shared/documentTypes.ts');
    console.error('3. Run this script again to verify fixes');
    process.exit(1);
  }
}

// Run validation (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateDocumentTypeMappings, validateCriticalMappings };