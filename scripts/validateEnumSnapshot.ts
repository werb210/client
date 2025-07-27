/**
 * Staff App Document Type Enum Snapshot Validator
 * Generates and validates canonical document type snapshots for contract enforcement
 * Created: January 27, 2025
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Staff App canonical 30-entry document types truth source
const CANONICAL_DOCUMENT_TYPES = [
  'accounts_payable',
  'accounts_receivable',
  'account_prepared_financials',
  'ap',
  'ar',
  'articles_of_incorporation',
  'balance_sheet',
  'bank_statements',
  'business_license',
  'business_plan',
  'cash_flow_statement',
  'collateral_docs',
  'debt_schedule',
  'drivers_license_front_back',
  'equipment_quote',
  'financial_statements',
  'income_statement',
  'invoice_samples',
  'lease_agreements',
  'other',
  'personal_financial_statement',
  'personal_guarantee',
  'profit_and_loss_statement',
  'proof_of_identity',
  'purchase_orders',
  'signed_application',
  'supplier_agreement',
  'tax_returns',
  'trade_references',
  'void_pad'
] as const;

interface EnumSnapshot {
  version: string;
  timestamp: string;
  documentTypes: readonly string[];
  checksum: string;
}

function generateChecksum(types: readonly string[]): string {
  const sorted = [...types].sort();
  const combined = sorted.join('|');
  // Simple checksum - in production you might use crypto.createHash
  return Buffer.from(combined).toString('base64').slice(0, 16);
}

function generateSnapshot(): EnumSnapshot {
  const timestamp = new Date().toISOString();
  const checksum = generateChecksum(CANONICAL_DOCUMENT_TYPES);
  
  return {
    version: '1.0.0',
    timestamp,
    documentTypes: CANONICAL_DOCUMENT_TYPES,
    checksum
  };
}

function validateSnapshot(snapshot: EnumSnapshot): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate structure
  if (!snapshot.version) errors.push('Missing version field');
  if (!snapshot.timestamp) errors.push('Missing timestamp field');
  if (!snapshot.documentTypes) errors.push('Missing documentTypes field');
  if (!snapshot.checksum) errors.push('Missing checksum field');
  
  // Validate document types count
  if (snapshot.documentTypes.length !== 30) {
    errors.push(`Expected 30 document types, found ${snapshot.documentTypes.length}`);
  }
  
  // Validate checksum
  const expectedChecksum = generateChecksum(snapshot.documentTypes);
  if (snapshot.checksum !== expectedChecksum) {
    errors.push(`Checksum mismatch: expected ${expectedChecksum}, got ${snapshot.checksum}`);
  }
  
  // Validate against canonical types
  const missing = CANONICAL_DOCUMENT_TYPES.filter(type => !snapshot.documentTypes.includes(type));
  const extra = snapshot.documentTypes.filter(type => !CANONICAL_DOCUMENT_TYPES.includes(type));
  
  if (missing.length > 0) {
    errors.push(`Missing canonical types: ${missing.join(', ')}`);
  }
  
  if (extra.length > 0) {
    errors.push(`Extra types not in canonical list: ${extra.join(', ')}`);
  }
  
  return { valid: errors.length === 0, errors };
}

async function main() {
  console.log('🔒 STAFF APP DOCUMENT TYPE ENUM VALIDATION');
  console.log('==========================================');
  
  const snapshotPath = join(__dirname, '../shared/documentTypeSnapshot.json');
  const currentSnapshot = generateSnapshot();
  
  console.log(`📋 Canonical Document Types: ${CANONICAL_DOCUMENT_TYPES.length}`);
  console.log(`🔐 Generated Checksum: ${currentSnapshot.checksum}`);
  
  // Check if snapshot file exists
  if (existsSync(snapshotPath)) {
    try {
      const existingContent = readFileSync(snapshotPath, 'utf-8');
      const existingSnapshot: EnumSnapshot = JSON.parse(existingContent);
      
      console.log('\n🔍 VALIDATING EXISTING SNAPSHOT');
      console.log('------------------------------');
      
      const validation = validateSnapshot(existingSnapshot);
      
      if (validation.valid) {
        console.log('✅ Existing snapshot is valid');
        
        // Check if update needed
        if (existingSnapshot.checksum === currentSnapshot.checksum) {
          console.log('✅ Snapshot is up to date');
          console.log('\n🎉 VALIDATION PASSED - No changes needed');
          process.exit(0);
        } else {
          console.log('⚠️  Snapshot checksum differs - update needed');
        }
      } else {
        console.log('❌ Existing snapshot validation FAILED:');
        validation.errors.forEach(error => console.log(`   - ${error}`));
      }
    } catch (error) {
      console.log('❌ Failed to read/parse existing snapshot:', error);
    }
  } else {
    console.log('📝 No existing snapshot found - creating new one');
  }
  
  console.log('\n📝 GENERATING NEW SNAPSHOT');
  console.log('---------------------------');
  
  try {
    // Ensure shared directory exists
    const sharedDir = dirname(snapshotPath);
    if (!existsSync(sharedDir)) {
      mkdirSync(sharedDir, { recursive: true });
    }
    
    writeFileSync(snapshotPath, JSON.stringify(currentSnapshot, null, 2));
    console.log(`✅ Snapshot written to: ${snapshotPath}`);
    
    // Final validation
    const validation = validateSnapshot(currentSnapshot);
    if (validation.valid) {
      console.log('✅ New snapshot validation PASSED');
      console.log('\n🎉 ENUM SNAPSHOT GENERATION COMPLETED');
      console.log(`📊 Total Document Types: ${currentSnapshot.documentTypes.length}`);
      console.log(`🔐 Checksum: ${currentSnapshot.checksum}`);
      console.log(`📅 Timestamp: ${currentSnapshot.timestamp}`);
    } else {
      console.log('❌ New snapshot validation FAILED:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Failed to write snapshot:', error);
    process.exit(1);
  }
}

// ES module entry point check
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSnapshot, validateSnapshot, CANONICAL_DOCUMENT_TYPES };