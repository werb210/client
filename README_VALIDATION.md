# Lender Products Validation Suite

This validation suite proves that the **lender products schema**, **client DB sync**, and **recommendation engine** are working correctly.

## Quick Answers

**1. Client DB Storage**: `localStorage` with key `'lender_products_cache'`
**2. Recommendation Engine**: `client/src/lib/strictRecommendationEngine.ts` → `getProductRecommendations(products, filters)`

## Files Created

### Scripts
- `scripts/check_lender_products_schema.js` - Validates Staff API schema
- `scripts/quick_schema_check.sh` - Standalone schema validation  
- `scripts/run_validation_suite.sh` - Complete end-to-end validation
- `scripts/validate_client_ready.js` - Client readiness check

### Test Files  
- `tests/products.sync.spec.ts` - Playwright test for client/staff sync
- `tests/reco.engine.spec.ts` - Recommendation engine contract test

### Client Integration
- `client/src/auditHook.ts` - Runtime audit hook for client DB access
- Updated `client/src/main.tsx` - Installs audit hook on startup

## Usage

### 1. Quick Schema Check (Staff API)
```bash
# Test staff API schema without starting client
VITE_CLIENT_APP_SHARED_TOKEN=your_token scripts/quick_schema_check.sh
```

### 2. Full Validation Suite
```bash
# Complete end-to-end validation (requires staff API + client app)
VITE_STAFF_API_URL=https://staff.boreal.financial/api \
VITE_CLIENT_APP_SHARED_TOKEN=your_token \
scripts/run_validation_suite.sh
```

### 3. Individual Tests
```bash
# API schema only
node scripts/check_lender_products_schema.js

# Client readiness  
node scripts/validate_client_ready.js

# Recommendation engine (requires Playwright setup)
VITE_AUDIT=1 npx playwright test tests/reco.engine.spec.ts
```

## Pass/Fail Criteria

### ✅ API Schema Valid
- `scripts/check_lender_products_schema.js` prints `"ok": true`
- Sample objects contain required fields: `id`, `lender_id`, `name`, `country`, `amount_min`, `amount_max`, `active`

### ✅ Client DB In Sync  
- Playwright test passes: no missing IDs between staff API and client localStorage
- Client product count ≥ server product count

### ✅ Recommendation Engine Working
- Engine respects `country`, `amount_min/max`, `active` filters
- Returns scored recommendations in correct format
- Inactive products are excluded

## Current Status

**Schema**: ✅ Connected (returns 0 products - staff API needs population)  
**Client**: ✅ Ready with audit hooks installed  
**Engine**: ✅ Validated with contract tests  

**Next Step**: Populate staff API with ≥44 lender products, then run full validation suite.