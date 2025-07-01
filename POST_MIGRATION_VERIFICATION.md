# Post-Migration Verification Checklist

## 🔧 Layout + Navigation Testing

### MainLayout Integration
- [ ] Every page uses MainLayout from V1 design system
- [ ] Router logic points to correct V2 routes
- [ ] SideBySideApplication layout renders properly
- [ ] Progressive disclosure works across all steps

### Route Verification
- [ ] `/` → LandingPage (smart routing)
- [ ] `/login` → Login page
- [ ] `/register` → Registration page  
- [ ] `/side-by-side-application` → V1 SideBySideApplication
- [ ] `/step1-financial-profile` → V1 Step1 route
- [ ] `/step2-recommendations` → V1 Step2 route
- [ ] `/step3-business-details` → V1 Step3 route
- [ ] `/step4-financial-info` → V1 Step4 route
- [ ] `/step5-document-upload` → V1 Step5 route
- [ ] `/step6-signature` → V1 Step6 route

## 🧪 Functionality Testing

### Authentication Flow
- [ ] User registration works with V1 layout
- [ ] User login works with V1 layout
- [ ] AuthGuard properly protects routes
- [ ] Backend diagnostic page accessible

### Application Workflow
- [ ] 7-step application process using V1 components
- [ ] Form state persistence across steps
- [ ] Step progression and validation
- [ ] Document upload functionality
- [ ] Signature completion flow

### Responsive Design
- [ ] Desktop view (3 steps visible)
- [ ] Tablet view (2 steps visible)
- [ ] Mobile view (1 step visible)
- [ ] Navigation controls work on all sizes

## 📁 Legacy Component Audit

### Archived Components
- [ ] `/v2-legacy-archive/` contains deprecated components
- [ ] `ComprehensiveApplication.tsx` archived
- [ ] Individual Step form components archived
- [ ] README.md explains deprecation

### ESLint Protection
- [ ] ESLint rules prevent legacy imports
- [ ] Warnings appear for deprecated component usage
- [ ] `/v2-design-system/` imports work correctly

## 🎯 Design System Compliance

### Boreal Financial Branding
- [ ] Teal (#7FB3D3) and Orange (#E6B75C) colors
- [ ] Professional gradient backgrounds
- [ ] Consistent typography and spacing
- [ ] Brand-aligned component styling

### V1 Layout Features
- [ ] Side-by-side step comparison
- [ ] View mode toggle (Desktop/Tablet/Mobile)
- [ ] Progress indicator and step navigation
- [ ] Card-based layout with status colors

## Status: In Progress

Starting verification process...