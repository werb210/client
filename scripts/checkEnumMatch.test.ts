/**
 * Client Document Categories Enum Contract Test
 * Ensures client document categories match Staff App canonical snapshot
 * Created: January 27, 2025
 */

const { DOCUMENT_CATEGORIES } = require('../client/src/lib/documentCategories');
const { readFileSync, existsSync } = require('fs');
const path = require('path');

// EnumSnapshot interface for TypeScript checking

describe('Document Enum Contract Tests', () => {
  let snapshot: EnumSnapshot;
  
  beforeAll(() => {
    const snapshotPath = path.join(__dirname, '../shared/documentTypeSnapshot.json');
    
    if (!existsSync(snapshotPath)) {
      throw new Error(`Snapshot file not found: ${snapshotPath}. Run 'npm run generate:enum-snapshot' first.`);
    }
    
    try {
      const snapshotContent = readFileSync(snapshotPath, 'utf-8');
      snapshot = JSON.parse(snapshotContent);
    } catch (error) {
      throw new Error(`Failed to read snapshot file: ${error}`);
    }
  });

  test('Client document categories match backend enum snapshot', () => {
    const snapshotTypes = snapshot.documentTypes;
    const clientTypes = DOCUMENT_CATEGORIES;
    
    // Find missing types in client
    const missingInClient = snapshotTypes.filter((type) => !clientTypes.includes(type));
    
    // Find extra types in client
    const extraInClient = clientTypes.filter((type) => !snapshotTypes.includes(type));
    
    // Both should be empty for perfect match
    expect(missingInClient).toEqual([]);
    expect(extraInClient).toEqual([]);
    
    // Additional validation: count should match
    expect(clientTypes.length).toBe(snapshotTypes.length);
    expect(clientTypes.length).toBe(30); // Expected canonical count
  });

  test('Client document categories contain all required canonical types', () => {
    const requiredTypes = [
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
    ];

    requiredTypes.forEach(type => {
      expect(DOCUMENT_CATEGORIES).toContain(type);
    });
  });

  test('Client document categories have no duplicates', () => {
    const uniqueTypes = [...new Set(DOCUMENT_CATEGORIES)];
    expect(uniqueTypes.length).toBe(DOCUMENT_CATEGORIES.length);
  });

  test('Client document categories are in valid format', () => {
    DOCUMENT_CATEGORIES.forEach(type => {
      // Should be lowercase with underscores
      expect(type).toMatch(/^[a-z_]+$/);
      
      // Should not be empty
      expect(type.length).toBeGreaterThan(0);
      
      // Should not start or end with underscore
      expect(type).not.toMatch(/^_|_$/);
    });
  });

  test('Snapshot is valid and recent', () => {
    // Validate snapshot structure
    expect(snapshot).toHaveProperty('version');
    expect(snapshot).toHaveProperty('timestamp');
    expect(snapshot).toHaveProperty('documentTypes');
    expect(snapshot).toHaveProperty('checksum');
    
    // Validate snapshot age (should not be older than 30 days)
    const snapshotDate = new Date(snapshot.timestamp);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    expect(snapshotDate.getTime()).toBeGreaterThan(thirtyDaysAgo.getTime());
    
    // Validate document types count
    expect(snapshot.documentTypes.length).toBe(30);
  });

  test('Critical legacy mappings are preserved', () => {
    // These types should exist for backward compatibility
    const criticalTypes = [
      'account_prepared_financials', // Maps from financial_statements
      'profit_and_loss_statement',   // Maps from profit_loss_statement
      'void_pad',                   // Maps from void_cheque
      'personal_financial_statement' // Maps from personal_financials
    ];

    criticalTypes.forEach(type => {
      expect(DOCUMENT_CATEGORIES).toContain(type);
    });
  });
});