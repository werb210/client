# Staff App Backend Enum Truth Source
## Canonical Document Types - Version 1.0.0 🔒 LOCKED

> **⚠️ CONTRACT LOCKED**: This enum contract is locked to v1.0.0 as of 2025-07-27T21:48:00.000Z. 
> All modifications require [ENUM-AUTHORIZED] commit message and version increment.
> See CI enforcement in .github/workflows/enum-validation.yml

**Last Updated:** January 27, 2025  
**Checksum:** YWNjb3VudF9wcmVw  
**Total Count:** 30 Types

### Canonical Document Type Enums

```typescript
enum DocumentType {
  ACCOUNTS_PAYABLE = 'accounts_payable',
  ACCOUNTS_RECEIVABLE = 'accounts_receivable', 
  ACCOUNT_PREPARED_FINANCIALS = 'account_prepared_financials',
  AP = 'ap',
  AR = 'ar',
  ARTICLES_OF_INCORPORATION = 'articles_of_incorporation',
  BALANCE_SHEET = 'balance_sheet',
  BANK_STATEMENTS = 'bank_statements',
  BUSINESS_LICENSE = 'business_license',
  BUSINESS_PLAN = 'business_plan',
  CASH_FLOW_STATEMENT = 'cash_flow_statement',
  COLLATERAL_DOCS = 'collateral_docs',
  DEBT_SCHEDULE = 'debt_schedule',
  DRIVERS_LICENSE_FRONT_BACK = 'drivers_license_front_back',
  EQUIPMENT_QUOTE = 'equipment_quote',
  FINANCIAL_STATEMENTS = 'financial_statements',
  INCOME_STATEMENT = 'income_statement',
  INVOICE_SAMPLES = 'invoice_samples',
  LEASE_AGREEMENTS = 'lease_agreements',
  OTHER = 'other',
  PERSONAL_FINANCIAL_STATEMENT = 'personal_financial_statement',
  PERSONAL_GUARANTEE = 'personal_guarantee',
  PROFIT_AND_LOSS_STATEMENT = 'profit_and_loss_statement',
  PROOF_OF_IDENTITY = 'proof_of_identity',
  PURCHASE_ORDERS = 'purchase_orders',
  SIGNED_APPLICATION = 'signed_application',
  SUPPLIER_AGREEMENT = 'supplier_agreement',
  TAX_RETURNS = 'tax_returns',
  TRADE_REFERENCES = 'trade_references',
  VOID_PAD = 'void_pad'
}
```

### Critical Legacy Mappings

```typescript
const LEGACY_TO_CANONICAL = {
  'financial_statements': 'account_prepared_financials',
  'profit_loss_statement': 'profit_and_loss_statement', 
  'void_cheque': 'void_pad',
  'personal_financials': 'personal_financial_statement',
  'pnl': 'profit_and_loss_statement',
  'p_and_l': 'profit_and_loss_statement',
  'accountant_financials': 'account_prepared_financials'
};
```

### Contract Enforcement Rules

1. **No Direct Enum Modifications**: All enum changes require [ENUM-AUTHORIZED] commit message
2. **Snapshot Validation**: CI validates against documentTypeSnapshot.json on every push
3. **Legacy Compatibility**: All mappings must maintain backward compatibility
4. **Client Sync**: Client app must match this truth source exactly
5. **Version Control**: Changes increment version and update checksum

### Validation Commands

```bash
# Generate/validate snapshot
npm run generate:enum-snapshot

# Test client contract
npm run test:enum-contract

# Full validation
npm run validate:enums
```