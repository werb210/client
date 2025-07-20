# Step 5 Document Upload System Logic Explanation

## Overview
Step 5 is the document upload step in our 6-step financial application workflow. It handles the aggregation of document requirements from multiple lender products and provides upload functionality for each required document type.

## Key Components

### 1. Document Requirements Aggregation
**Location**: `client/src/routes/Step5_DocumentUpload.tsx` lines 108-150
**Purpose**: Determines what documents are required based on user selections from previous steps.

```typescript
// Collects user selections from previous steps
const selectedCategory = state.step2?.selectedCategory || '';
const selectedCountry = state.step1?.businessLocation || '';
const requestedAmount = state.step1?.fundingAmount || 0;

// Calls aggregation function to get required documents
const results = await getDocumentRequirementsAggregation(
  selectedCategory,
  selectedCountry, 
  requestedAmount
);
```

### 2. Document Requirements Display
**Location**: `client/src/components/DynamicDocumentRequirements.tsx`
**Purpose**: Renders upload cards for each required document type with deduplication logic.

#### Deduplication Logic (lines 586-620):
- Uses `Set<string>` to track rendered document types (not display labels)
- Normalizes document names to API types using `normalizeDocumentName()`
- Prevents duplicate upload areas for same document type
- Example: "Financial Statements" and "Accountant Prepared Financial Statements" both normalize to `financial_statements`

#### Document Type Mapping:
```typescript
// Display Label → API Document Type
"Bank Statements" → "bank_statements"
"Accountant Prepared Financial Statements" → "financial_statements"
"Tax Returns" → "tax_returns"
```

### 3. File Upload Process
**Location**: `client/src/components/DynamicDocumentRequirements.tsx` lines 356-454

#### Upload Flow:
1. User selects files in upload card
2. Files mapped to correct API document type using `getApiCategory()`
3. FormData created with `document` file and `documentType` field
4. Upload sent to `/api/public/upload/${applicationId}` endpoint
5. Server forwards to staff backend at `https://staff.boreal.financial/api`
6. Response updates file status to "completed" with documentId

#### Upload Payload:
```typescript
const formData = new FormData();
formData.append('document', file);
formData.append('documentType', category.toLowerCase().replace(/\s+/g, '_'));
```

### 4. File Display and Validation
**Location**: `client/src/components/DynamicDocumentRequirements.tsx` lines 174-213

#### File Filtering Logic:
```typescript
const documentFiles = uploadedFiles.filter(f => {
  const fileDocType = f.documentType?.toLowerCase() || '';
  const apiDocumentType = getApiDocumentType(doc.label);
  const isMatch = f.status === "completed" && fileDocType === apiDocumentType;
  return isMatch;
});
```

#### Validation Logic (lines 622-786):
- Matches uploaded files to requirements using API document types
- Counts files per requirement type
- Determines completion status based on required quantities:
  - Bank Statements: 6 files required
  - Accountant Prepared Financial Statements: 3 files required
  - Other documents: 1 file required

### 5. State Management
**Location**: `client/src/routes/Step5_DocumentUpload.tsx` lines 78-91

#### File State Structure:
```typescript
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "completed" | "uploading" | "error";
  documentType: string; // API document type from server
  file: File;
}
```

#### State Sources:
1. `uploadedFiles` - Client-side state tracking uploads
2. `state.step5DocumentUpload?.uploadedFiles` - Form context persistence
3. Server response from `/api/public/applications/${applicationId}/documents`

### 6. Navigation Logic
**Location**: `client/src/routes/Step5_DocumentUpload.tsx` lines 334-380

#### Continue Button Requirements:
1. All required document types must have sufficient uploads
2. Backend verification confirms documents exist
3. Application ID must be present
4. Validation passes using `validateDocumentUploads()`

## Critical Mappings

### Document Type Normalization:
- **Input**: Display labels from lender product requirements
- **Process**: `normalizeDocumentName()` function in `shared/documentTypes.ts`
- **Output**: Standardized API document types

### Upload Card Display:
- **Input**: API document types from uploaded files
- **Process**: `getApiDocumentType()` function maps display labels to API types
- **Output**: Files appear in correct upload card sections

## Common Issues and Solutions

### Issue: Files uploaded but not displaying in cards
**Cause**: Mismatch between upload API type and display mapping
**Solution**: Ensure `getApiCategory()` (upload) and `getApiDocumentType()` (display) use same mapping logic

### Issue: Duplicate upload areas
**Cause**: Deduplication happening at display label level instead of document type level
**Solution**: Use `Set<string>` tracking actual document types, not display labels

### Issue: Validation showing 0/X files despite uploads
**Cause**: File filtering logic not matching uploaded files to requirements
**Solution**: Use consistent API document type mapping in both upload and validation logic

## Data Flow Summary

1. **Step 1-2**: User selections stored in form context
2. **Step 5 Mount**: Document aggregation determines requirements
3. **File Upload**: Files uploaded with API document type classification
4. **Server Storage**: Files stored in staff backend with documentType field
5. **Client Display**: Files fetched and displayed in matching upload cards
6. **Validation**: File counts validated against requirement quantities
7. **Navigation**: Continue button enabled when all requirements met

This system ensures that files uploaded for "Accountant Prepared Financial Statements" (display label) are stored as `financial_statements` (API type) and correctly displayed in the matching upload card section.