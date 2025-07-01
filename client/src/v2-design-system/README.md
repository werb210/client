# V2 Design System Migration

This directory contains the **official Boreal Financial design system** extracted from V1 and optimized for V2.

## Migration Status

### ✅ Completed
- [x] Design system directory structure
- [ ] V1 layout extraction
- [ ] V2 App.tsx replacement
- [ ] Legacy layout archival
- [ ] Route migration audit
- [ ] ESLint rules for legacy prevention

### 🎯 Source of Truth Components (V1 Reference)
- `MainLayout.tsx` - Primary application shell
- `SideBySideLayout.tsx` - Multi-step form layout
- `StepIndicator.tsx` - Progress tracking component
- `AppShell.tsx` - Root application wrapper

### ⚠️ Legacy Components (DO NOT USE)
- `client/src/pages/ComprehensiveApplication.tsx` - Old layout
- `client/src/components/forms/*` - Individual step components (use V1 routes instead)

### 🔧 Configuration Files
- `tailwind.config.ts` - Design tokens and theme
- `index.css` - Global styles and CSS variables
- Boreal Financial color scheme: Teal (#7FB3D3) and Orange (#E6B75C)

## Usage in V2

```tsx
// ✅ Correct - Use V2 design system
import { MainLayout } from '@/v2-design-system/MainLayout';

// ❌ Wrong - Legacy component
import { ComprehensiveApplication } from '@/pages/ComprehensiveApplication';
```

## Next Steps

1. Extract V1 SideBySideApplication layout components
2. Replace V2 App.tsx routing structure
3. Archive legacy layouts with deprecation warnings
4. Implement ESLint rules to prevent legacy usage
5. Audit all V2 routes for layout compliance