# COMPREHENSIVE BUSINESS LOGIC EXTRACTION REPORT

**Generated:** July 21, 2025  
**Purpose:** Read-only logic extraction for Step 2 (recommendation engine) and Step 5 (document upload/mapping) components  
**Scope:** All business rules, conditionals, filtering logic, document mapping logic, and hardcoded workarounds  

## STEP 2 BUSINESS LOGIC ANALYSIS

### Core Components
- **Primary File:** `client/src/components/Step2RecommendationEngine.tsx`
- **Logic Engine:** `client/src/lib/recommendation.ts`
- **Supporting Hooks:** `client/src/hooks/useProductCategories.ts`

### 1. GEOGRAPHY/LOCATION MAPPING LOGIC

#### Location Normalization Rules (Step2RecommendationEngine.tsx:39-45)
```typescript
const normalizeLocation = (location: string): string => {
  if (!location) return 'CA'; // DEFAULT TO CANADA
  const lower = location.toLowerCase();
  if (lower === 'united-states' || lower === 'united states' || lower === 'us') return 'US';
  if (lower === 'canada' || lower === 'ca') return 'CA';
  return location;
}
```

**Business Rules:**
- **Default Geographic Market:** Canada ('CA') when location undefined
- **US Variations:** 'united-states', 'united states', 'us' → 'US'  
- **CA Variations:** 'canada', 'ca' → 'CA'
- **Field Mapping:** `formData.headquarters` OR `formData.businessLocation` (backward compatibility)

#### Geography Matching in Product Filtering (recommendation.ts:78-82)
```typescript
const countryMatch = product.country === normalizedHQ || 
                    product.country === 'Both' ||
                    product.geography?.includes(normalizedHQ) ||
                    (normalizedHQ === 'CA' && product.country?.includes('CA')) ||
                    (normalizedHQ === 'US' && product.country?.includes('US'));
```

**Business Rules:**
- **Exact Match:** Product country must match normalized headquarters
- **Universal Products:** Products with country='Both' match all locations
- **Geography Array Support:** Products can have geography array field
- **Partial String Matching:** Country field can contain 'CA' or 'US' as substring

### 2. EQUIPMENT FINANCING BUSINESS RULES

#### Equipment Financing Visibility Logic (recommendation.ts:94-99)
```typescript
const equipmentExclusion = isEquipmentFinancing && 
                          lookingFor === 'capital' && 
                          fundsPurpose !== 'equipment' &&
                          !fundsPurpose?.includes('equipment');
```

**Business Rules:**
- **Show Equipment Financing When:**
  - User selects `lookingFor = 'equipment'` OR `lookingFor = 'both'`  
  - OR user selects `fundsPurpose = 'equipment'`
  - OR `fundsPurpose` contains 'equipment' substring
- **Hide Equipment Financing When:**
  - User selects `lookingFor = 'capital'` AND `fundsPurpose` doesn't contain 'equipment'
- **Relaxed Rules:** Equipment financing visible for mixed use cases

### 3. INVOICE FACTORING BUSINESS RULES

#### Accounts Receivable Exclusion Logic (recommendation.ts:90-92)
```typescript
const isInvoiceFactoring = product.category?.toLowerCase().includes('factoring') || 
                          product.category?.toLowerCase().includes('invoice');
const factorExclusion = isInvoiceFactoring && accountsReceivableBalance === 0;
```

**Business Rules:**
- **Hide Invoice Factoring When:** `accountsReceivableBalance === 0`
- **Product Detection:** Category contains 'factoring' OR 'invoice' (case-insensitive)
- **Show When:** User has existing accounts receivable balance > 0

### 4. FUNDING AMOUNT RANGE FILTERING

#### Multi-Field Amount Support (recommendation.ts:12-23)
```typescript
const getAmountValue = (product: any, field: 'min' | 'max'): number => {
  let amount: any;
  if (field === 'min') {
    amount = product.minAmount ?? product.amountMin ?? product.amount_min ?? product.min_amount ?? product.fundingMin ?? 0;
  } else {
    amount = product.maxAmount ?? product.amountMax ?? product.amount_max ?? product.max_amount ?? product.fundingMax ?? Infinity;
  }
  // String parsing and validation logic...
}
```

**Business Rules:**
- **Field Name Support:** `minAmount`, `amountMin`, `amount_min`, `min_amount`, `fundingMin`
- **Default Values:** min=0, max=Infinity for undefined amounts
- **String Parsing:** Removes non-numeric characters from string amounts
- **Range Matching:** `fundingAmount >= minAmount && fundingAmount <= maxAmount`

### 5. PRODUCT TYPE MATCHING LOGIC

#### Type Preference Filtering (recommendation.ts:101-106)
```typescript
const typeMatch = lookingFor === 'both' ||
                 (lookingFor === 'capital' && !categoryLower.includes('equipment')) ||
                 (lookingFor === 'equipment' && categoryLower.includes('equipment')) ||
                 (fundsPurpose === 'equipment' && categoryLower.includes('equipment'));
```

**Business Rules:**
- **Show All Products:** When `lookingFor = 'both'`
- **Capital Products:** When `lookingFor = 'capital'` AND category doesn't contain 'equipment'
- **Equipment Products:** When `lookingFor = 'equipment'` AND category contains 'equipment'
- **Purpose Override:** When `fundsPurpose = 'equipment'` regardless of lookingFor value

### 6. RECOMMENDATION SCORING ALGORITHM

#### Multi-Factor Scoring System (recommendation.ts:135-194)
```typescript
// Geography match (25 points)
// Funding range match (25 points)  
// Product type preference match (25 points)
// Revenue requirement match (25 points)
// Bonus points for special matching rules
```

**Scoring Rules:**
- **Geography Match:** 25 points for country/geography alignment
- **Amount Range:** 25 points when funding amount within product limits
- **Type Preference:** 25 points for product type matching user selection
- **Revenue Match:** 25 points when monthly revenue meets minimum requirements
- **Factoring Bonus:** +10 points when user has receivables and product is factoring
- **PO Financing Bonus:** +10 points when purpose='inventory' and category contains 'purchase order'
- **Score Cap:** Maximum 100% match score

## STEP 5 BUSINESS LOGIC ANALYSIS

### Core Components
- **Primary File:** `client/src/routes/Step5_DocumentUpload.tsx`
- **Document Logic:** `client/src/components/DynamicDocumentRequirements.tsx`  
- **Aggregation Engine:** `client/src/lib/documentAggregation.ts`
- **Intersection Engine:** `client/src/lib/documentIntersection.ts`

### 7. DOCUMENT REQUIREMENTS AGGREGATION LOGIC

#### Union vs Intersection Strategy (documentAggregation.ts:34-41)
```typescript
/**
 * Get document requirements using aggregation logic (union of all eligible products)
 * Following ChatGPT team specifications for complete document collection
 */
```

**Business Rules:**
- **UNION APPROACH:** Collect ALL documents required by ANY eligible lender
- **Comprehensive Coverage:** Ensures users upload all possible required documents
- **Deduplication:** Normalize document names before removing duplicates
- **Display Labels:** Use human-readable labels for UI while maintaining API compatibility

#### Product Filtering for Aggregation (documentAggregation.ts:78-96)
```typescript
const eligibleProducts = allProducts.filter(product => {
  const categoryMatch = product.category === selectedCategory;
  const countryMatch = product.country === normalizedCountry;
  const amountMatch = minAmount <= requestedAmount && maxAmount >= requestedAmount;
  return categoryMatch && countryMatch && amountMatch;
});
```

**Business Rules:**
- **Category Match:** Exact match with Step 2 selected category
- **Country Match:** Exact match with Step 1 business location
- **Amount Range:** Requested amount must fall within product min/max limits
- **Field Support:** Multiple field names for amounts (`min_amount`, `amountMin`, etc.)

### 8. DOCUMENT TYPE MAPPING SYSTEM

#### API Category Mapping (DynamicDocumentRequirements.tsx:204-329)
```typescript
const getApiCategory = (label: string): string => {
  const labelLower = label.toLowerCase();
  
  // Bank statements - exact match
  if (labelLower.includes('bank') && labelLower.includes('statement')) {
    return 'bank_statements';
  }
  
  // Accountant Prepared Financial Statements - same as financial_statements
  if (labelLower.includes('accountant') && labelLower.includes('prepared') && labelLower.includes('financial')) {
    return 'financial_statements';
  }
  // ... 22+ document type mappings
}
```

**Critical Mapping Rules:**
- **Bank Statements:** 'bank' + 'statement' → 'bank_statements'
- **Financial Statements:** Multiple variations → 'financial_statements'  
  - 'Accountant Prepared Financial Statements' → 'financial_statements'
  - 'Financial Statements' → 'financial_statements'
- **Equipment Quote:** 'equipment' + 'quote' → 'equipment_quote'
- **Tax Returns:** 'tax' + 'return' → 'tax_returns'
- **Staff Backend Compatibility:** Only accepts specific API document types

### 9. DOCUMENT QUANTITY REQUIREMENTS

#### Quantity Rules (shared/documentTypes.ts:87-111)
```typescript
export const DOCUMENT_QUANTITIES: Record<DocumentType, number> = {
  'bank_statements': 6,     // Typically 6 months
  'financial_statements': 3, // P&L, Balance Sheet, Cash Flow  
  'tax_returns': 2,         // Typically 2-3 years
  'invoice_samples': 3,     // Sample invoices
  'drivers_license_front_back': 2, // Front and back
  // ... other types default to 1
}
```

**Quantity Business Rules:**
- **Bank Statements:** Always require 6 months
- **Financial Statements:** Require 3 documents (P&L, Balance Sheet, Cash Flow)
- **Tax Returns:** Require 2 years minimum
- **Driver's License:** Require front AND back
- **Default Quantity:** 1 document for most types

### 10. DOCUMENT VALIDATION LOGIC

#### Upload Validation System (Step5_DocumentUpload.tsx:341-390)
```typescript
const validateDocumentUploads = (requirements: string[], files: UploadedFile[]) => {
  // Group uploaded files by normalized document type
  const filesByType = files.reduce((acc, file) => {
    if (file.status === 'completed' && file.documentType) {
      const normalizedType = normalizeDocumentName(file.documentType);
      if (!acc[normalizedType]) acc[normalizedType] = [];
      acc[normalizedType].push(file);
    }
    return acc;
  }, {} as Record<string, UploadedFile[]>);
  
  // Validate each requirement
  const validationResults = requirements.map(requirement => {
    const normalizedRequirement = normalizeDocumentName(requirement);
    const uploadedFiles = filesByType[normalizedRequirement] || [];
    
    // Determine required quantity using same logic as deduplication
    const requiredCount = requirement.toLowerCase().includes('bank') && requirement.toLowerCase().includes('statement') ? 6 :
                         requirement.toLowerCase().includes('accountant') && requirement.toLowerCase().includes('financial') && requirement.toLowerCase().includes('statement') ? 3 : 1;
    
    const isComplete = uploadedFiles.length >= requiredCount;
    return { documentType: requirement, required: requiredCount, uploaded: uploadedFiles.length, complete: isComplete };
  });
}
```

**Validation Business Rules:**
- **Status Filter:** Only count files with 'completed' status
- **Normalization:** Use `normalizeDocumentName()` for consistent matching
- **Dynamic Quantities:** Bank statements=6, Financial statements=3, others=1
- **Completion Logic:** `uploadedFiles.length >= requiredCount`

### 11. DOCUMENT DEDUPLICATION SYSTEM

#### Type-Level Deduplication (documentAggregation.ts:122-144)
```typescript
// Normalize all documents to their standard types, then deduplicate by document type
const normalizedDocumentTypes = new Set<string>();
const deduplicatedDocuments: string[] = [];

for (const docName of allRawDocuments) {
  const normalizedType = normalizeDocumentName(docName);
  
  if (!normalizedDocumentTypes.has(normalizedType)) {
    normalizedDocumentTypes.add(normalizedType);
    // Use the display label for the final output
    const displayLabel = getDocumentLabel(normalizedType);
    deduplicatedDocuments.push(displayLabel);
  }
}
```

**Deduplication Rules:**
- **Normalization First:** Convert all document names to standard types
- **Set-Based Deduplication:** Use Set to track unique document types
- **Display Labels:** Output human-readable labels while maintaining type consistency
- **Prevents Duplicates:** "Financial Statements" + "Accountant Prepared Financial Statements" → single upload area

### 12. UPLOAD ENDPOINT INTEGRATION

#### Staff Backend Upload Logic (DynamicDocumentRequirements.tsx:364-416)
```typescript
const uploadResponse = await fetch(`/api/public/upload/${applicationId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
  },
  body: formData
});
```

**Upload Integration Rules:**
- **Endpoint:** `/api/public/upload/${applicationId}` 
- **Authentication:** Bearer token from `VITE_CLIENT_APP_SHARED_TOKEN`
- **Payload:** FormData with `document` (file) and `documentType` (API category)
- **Immediate Upload:** Files upload to staff backend as soon as selected
- **Status Tracking:** uploading → completed → error states

## HARDCODED WORKAROUNDS IDENTIFIED

### 1. Geographic Field Mapping Workaround
**Location:** Step2RecommendationEngine.tsx:47  
**Issue:** Handles both `formData.headquarters` AND `formData.businessLocation`  
**Workaround:** Field mapping compatibility between different form versions

### 2. Multiple Document Field Name Support  
**Location:** documentAggregation.ts:110-116  
**Issue:** Staff backend uses inconsistent field names for document requirements  
**Workaround:** Checks `doc_requirements` || `documentRequirements` || `requiredDocuments` || `required_documents`

### 3. Amount Field Normalization
**Location:** recommendation.ts:12-23  
**Issue:** Products have inconsistent amount field naming  
**Workaround:** Multi-field support with fallback chain and string parsing

### 4. Country Code Normalization  
**Location:** documentAggregation.ts:73-76  
**Issue:** Inconsistent country representation across system  
**Workaround:** Manual mapping of variations to standard codes

### 5. Equipment Financing Relaxed Rules
**Location:** recommendation.ts:94-99  
**Issue:** Original rules too restrictive for mixed-use cases  
**Workaround:** Added `fundsPurpose` override logic for equipment visibility

### 6. Document Type Mapping Duplication
**Location:** DynamicDocumentRequirements.tsx:204-329 AND shared/documentMapping.ts  
**Issue:** Same mapping logic exists in multiple files  
**Workaround:** Duplicate implementations for different use cases

## CRITICAL STAFF BACKEND DEPENDENCIES

### Document Type Compatibility
- Staff backend only accepts specific document types from `SUPPORTED_DOCUMENT_TYPES`
- Upload function must use correct API category mapping
- Validation logic must match upload logic exactly

### API Field Name Variations
- Products API returns inconsistent field names requiring multi-field support
- Document requirements use multiple field name patterns  
- Amount ranges use different field naming conventions

### Authentication Requirements
- All uploads require Bearer token authentication
- Token stored in `VITE_CLIENT_APP_SHARED_TOKEN` environment variable
- Missing token causes 401 authentication failures

## BUSINESS RULE CONFLICTS IDENTIFIED

### 1. Equipment Financing Visibility
**Conflict:** User selects 'capital' but purpose includes 'equipment'  
**Resolution:** Purpose field overrides looking-for preference  

### 2. Document Mapping Consistency  
**Conflict:** Multiple variations of financial statements map to same API type  
**Resolution:** All financial statement variants → 'financial_statements'

### 3. Quantity Validation Logic
**Conflict:** Dynamic quantity calculation in validation vs static mapping in types  
**Resolution:** Validation uses inline logic, types file provides defaults

## RECOMMENDATIONS FOR REVIEW

1. **Consolidate Document Mapping:** Eliminate duplicate mapping logic between files
2. **Standardize Field Names:** Request staff backend API consistency for product fields  
3. **Extract Business Rules:** Move hardcoded conditionals to configuration objects
4. **Unify Geography Handling:** Create single source of truth for country normalization
5. **Document Type System:** Verify all 22 document types work end-to-end with staff backend

---

**Report Complete:** All major business logic, conditionals, filtering rules, and document mapping logic extracted from Step 2 and Step 5 components.