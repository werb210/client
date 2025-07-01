# V2 Legacy Components Archive - OBSOLETE

⚠️ **THESE COMPONENTS ARE OBSOLETE AND MUST NOT BE USED** ⚠️

This directory contains archived V2 components that have been **permanently replaced** by the V1-based design system. These components are preserved for historical reference only and are blocked by ESLint rules.

## Archived Components

### Layout Components
- `ComprehensiveApplication.tsx` - Replaced by V1 SideBySideApplication layout
- `Step*` form components - Replaced by V1 route-based components

### Why These Components Are Deprecated

1. **Inconsistent Layout**: V2 components used a different layout pattern than the proven V1 design
2. **Fragmented State Management**: Individual step components had isolated state instead of unified form context
3. **Poor User Experience**: Lacked the side-by-side comparison and progressive disclosure of V1
4. **Design System Misalignment**: Did not follow the established Boreal Financial design patterns

## Migration Path

| V2 Legacy Component | V1 Replacement | Status |
|-------------------|----------------|--------|
| `ComprehensiveApplication.tsx` | `SideBySideApplication` | ✅ Replaced |
| `Step3BusinessDetails.tsx` | `routes/Step3_BusinessDetails.tsx` | ✅ Replaced |
| `Step4ApplicantInfo.tsx` | `routes/Step4_FinancialInfo.tsx` | ✅ Replaced |
| `Step5DocumentUpload.tsx` | `routes/Step5_DocumentUpload.tsx` | ✅ Replaced |

## ESLint Rules

Add these rules to prevent accidental usage of legacy components:

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["*/v2-legacy-archive/*"],
            "message": "Do not import from v2-legacy-archive. Use v2-design-system components instead."
          }
        ]
      }
    ]
  }
}
```