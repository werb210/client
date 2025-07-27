# Production Deployment Guide
## CLIENT APPLICATION v1.0.0 Deployment Instructions

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** January 27, 2025

## Pre-Deployment Validation

### ✅ Contract Lock Verification
```bash
# Verify v1.0.0 contract lock status
node scripts/deployment-readiness-check.js

# Expected output: "DEPLOYMENT READINESS: APPROVED"
```

### ✅ Test Suite Execution
```bash
# Run enum contract validation
node test-enum-schema-contract.js

# Run full lifecycle test
node test-full-lifecycle-complete.js

# Generate final test report
node test-permanent-report-generator.js
```

## Deployment Steps

### 1. Environment Configuration

#### Production Environment Variables
```bash
# Core API Configuration
VITE_API_BASE_URL=https://staff.boreal.financial/api
VITE_CLIENT_APP_SHARED_TOKEN=[PRODUCTION_TOKEN]

# Contract Lock Protection
VITE_ALLOW_MAPPING_EDITS=false
VITE_ENUM_CONTRACT_VERSION=1.0.0

# Performance Settings
NODE_ENV=production
VITE_ENVIRONMENT=production
```

#### Test Mode Configuration (Optional)
```bash
# Copy test environment for validation
cp .env.test .env.test.production

# Enable test mode for validation
VITE_TEST_MODE=true
VITE_TEST_MODE_VERSION=1.0.0
```

### 2. Build Process

#### Frontend Build
```bash
# Install dependencies
npm install

# Run production build
npm run build

# Verify build output
ls -la dist/
```

#### Backend Preparation
```bash
# Verify server configuration
node server/index.ts --check

# Test API endpoints
curl -X GET https://your-domain.com/api/health
```

### 3. Contract Lock Validation

#### Verify Locked Contracts
- ✅ `shared/documentTypeSnapshot.json` - locked: true, version: "1.0.0"
- ✅ `shared/apiContractLock.json` - version: "1.0.0", locked: true
- ✅ `BACKEND_ENUM_TRUTH_SOURCE.md` - Contains "🔒 LOCKED" and "CONTRACT LOCKED"

#### CI/CD Pipeline Verification
```bash
# Test enum protection
git commit -m "test: attempt enum modification" --allow-empty

# Should fail with "Contract lock violation detected"
# Use [ENUM-AUTHORIZED] prefix for legitimate changes
```

### 4. Security Checklist

#### API Security
- ✅ HTTPS enforcement active
- ✅ Bearer token authentication configured
- ✅ Input validation and sanitization
- ✅ Document type enum protection

#### Data Protection
- ✅ UUID validation for all operations
- ✅ File upload restrictions and validation
- ✅ Error handling without data exposure
- ✅ Secure session management

### 5. Performance Optimization

#### Frontend Optimization
- ✅ Tree shaking enabled
- ✅ Bundle splitting configured
- ✅ Lazy loading implemented
- ✅ Static asset caching
- ✅ Component optimization

#### Backend Optimization
- ✅ API response caching
- ✅ Database query optimization
- ✅ Error handling efficiency
- ✅ Resource monitoring

## Post-Deployment Validation

### 1. Smoke Tests

#### Core Functionality
```bash
# Test application creation
curl -X POST https://your-domain.com/api/public/applications \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test Corp","email":"test@example.com"}'

# Test document upload
curl -X POST https://your-domain.com/api/public/upload/[APP_ID] \
  -H "Authorization: Bearer [TOKEN]" \
  -F "document=@test.pdf" \
  -F "documentType=bank_statements"

# Test application finalization
curl -X PATCH https://your-domain.com/api/public/applications/[APP_ID]/finalize \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json"
```

#### Frontend Validation
- ✅ Application loads without errors
- ✅ Multi-step form workflow functional
- ✅ Document upload system operational
- ✅ Recommendation engine working
- ✅ Debug panels accessible (test mode)

### 2. Performance Monitoring

#### Key Metrics to Monitor
- **Response Times**: API endpoints < 500ms
- **Upload Performance**: Document processing < 2s
- **Form Validation**: Field validation < 100ms
- **Page Load**: Initial load < 3s
- **Error Rate**: < 1% for critical operations

#### Monitoring Setup
```bash
# Set up performance monitoring
npm install --save-dev lighthouse
npx lighthouse https://your-domain.com --output=json

# Expected scores:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 90
# SEO: > 90
```

### 3. Contract Integrity Monitoring

#### Automated Monitoring
```bash
# Set up daily contract validation
crontab -e

# Add daily enum contract check
0 9 * * * /path/to/scripts/validate-enum-contracts.sh
```

#### Alert Configuration
- ✅ CI failure notifications
- ✅ Contract modification alerts
- ✅ Performance degradation warnings
- ✅ Error rate threshold alerts

## Rollback Procedures

### Emergency Rollback
```bash
# Immediate rollback to previous version
git revert HEAD --no-edit
git push origin main

# Redeploy previous stable version
npm run deploy:rollback
```

### Contract Lock Recovery
```bash
# Restore contract locks from backup
cp backup/documentTypeSnapshot.json shared/
cp backup/apiContractLock.json shared/

# Verify integrity
node scripts/deployment-readiness-check.js
```

## Test Mode for Live Validation

### Enabling Test Mode
```bash
# Copy test configuration
cp .env.test .env.local

# Restart application
npm restart

# Verify test mode active (yellow banner visible)
```

### Test Mode Features
- 🧪 **Test Mode Indicator**: Yellow banner shows active status
- 🔧 **Debug Tools Panel**: Floating button provides access to:
  - Recommendation debug panel
  - Document mapping validation
  - Application state inspection
  - Test data clearing utilities
- 📋 **Mock Data**: Pre-configured test applications and documents
- 🔍 **Enhanced Logging**: Verbose validation and error reporting

### Live Applicant Testing
1. Enable test mode in production
2. Use test email domains (test.example.com)
3. Process mock applications through complete workflow
4. Validate staff backend integration
5. Verify automation triggers (OCR, banking, notifications)
6. Monitor performance and error rates

## Support and Monitoring

### Contact Information
- **Technical Support**: [Support Email]
- **Emergency Contact**: [Emergency Phone]
- **Documentation**: [Wiki/Docs URL]

### Monitoring Dashboards
- **Application Performance**: [APM URL]
- **Error Tracking**: [Error Monitoring URL]
- **Contract Status**: [Contract Dashboard URL]
- **User Analytics**: [Analytics Dashboard URL]

### Maintenance Schedule
- **Daily**: Contract integrity check
- **Weekly**: Performance review and optimization
- **Monthly**: Security audit and dependency updates
- **Quarterly**: Full system testing and documentation review

---

## Deployment Approval

**System Status**: ✅ PRODUCTION READY  
**Contract Lock**: ✅ v1.0.0 ACTIVE  
**Test Coverage**: ✅ COMPREHENSIVE  
**Security**: ✅ VALIDATED  
**Performance**: ✅ OPTIMIZED  

**Approved for Production Deployment**  
*Date: January 27, 2025*  
*Version: 1.0.0*  
*Confidence Level: HIGH*