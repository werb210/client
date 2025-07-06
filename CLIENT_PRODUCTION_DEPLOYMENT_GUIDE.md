# Client Production Deployment Guide
**Target URL:** https://clientportal.boreal.financial/  
**Target Backend:** https://app.boreal.financial/api  
**Status:** Ready for Deployment

## Environment Configuration

### ✅ Production Variables Configured
```bash
VITE_API_BASE_URL=https://app.boreal.financial/api
VITE_STAFF_API_URL=https://app.boreal.financial
VITE_SIGNNOW_REDIRECT_URL=https://clientportal.boreal.financial/step6-signature
NODE_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

### ✅ Secrets Configured
- CLIENT_APP_SHARED_TOKEN: Configured for backend authentication
- SIGNNOW_API_KEY: Configured for document signing integration

## Deployment Checklist

### Pre-Deployment
- [x] Environment variables configured for production backend
- [x] SignNow redirect URL set to production domain
- [x] Analytics and error reporting enabled
- [x] Secrets properly configured in environment

### Build Process
```bash
# Production build
npm run build

# Local testing (optional)
npx serve -s dist
```

### Post-Deployment Verification

**Required Smoke Tests:**
1. **Product Loading** - Verify 41 lenders load from production API
2. **Application Creation** - Ensure real `app_prod_*` IDs generated
3. **Document Upload** - Test file upload functionality
4. **SignNow Integration** - Verify embedded iframe loads correctly
5. **API Routing** - Confirm all requests go to `https://app.boreal.financial/api`

**Network Verification:**
- All API calls route to production backend
- No requests to `staffportal.replit.app`
- CORS headers properly configured

## SignNow Integration Verification

### Expected Behavior
1. **Step 4 → SignNow** - Application creates with real `app_prod_*` ID
2. **Embedded Invite** - SignNow returns embedded iframe URL
3. **Smart Fields** - Form data pre-populates in signing document
4. **Signer Role** - "Borrower" role assigned correctly
5. **Completion Detection** - Auto-redirect to Step 7 after signing

### Critical API Endpoints
- `POST /api/applications` - Application creation
- `POST /api/applications/:id/initiate-signing` - SignNow embedded invite
- `GET /api/applications/:id/signing-status` - Signing status polling

## Production Architecture

### Client-Backend Communication
```
Client (clientportal.boreal.financial)
    ↓ API Calls
Backend (app.boreal.financial/api)
    ↓ SignNow Integration
SignNow API (embedded invites)
```

### Authentication Flow
1. Client authenticates with CLIENT_APP_SHARED_TOKEN
2. Backend validates token and processes requests
3. SignNow integration uses SIGNNOW_API_KEY
4. Embedded invites return iframe-compatible URLs

## Success Criteria

### Infrastructure
- [x] Client deployed at https://clientportal.boreal.financial/
- [ ] Backend deployed at https://app.boreal.financial/api
- [ ] DNS resolution working for both domains
- [ ] SSL certificates active

### Functionality
- [ ] 41 lender products load correctly
- [ ] Application workflow completes Steps 1-7
- [ ] SignNow embedded invites work in iframe
- [ ] Smart Fields populate with form data
- [ ] Real application IDs generated (no fallbacks)

### Performance
- [ ] Page load times under 3 seconds
- [ ] API response times under 2 seconds
- [ ] Document upload progress tracking
- [ ] Error handling and retry mechanisms

## Monitoring and Analytics

### Error Tracking
- Production error reporting enabled
- API failure monitoring
- SignNow integration status tracking

### User Analytics
- Application completion rates
- Step-by-step conversion tracking
- Document upload success rates

## Troubleshooting

### Common Issues
1. **Internal Server Error** - Check backend deployment status
2. **API Not Found** - Verify backend URL configuration
3. **CORS Errors** - Confirm backend allows clientportal.boreal.financial
4. **SignNow Failures** - Check SIGNNOW_API_KEY validity

### Diagnostic Commands
```bash
# Test production deployment
node production-deployment-verification.js

# Check API connectivity
curl -I https://app.boreal.financial/api/health

# Verify client accessibility
curl -I https://clientportal.boreal.financial/
```

## Final Verification

Once deployed, the production environment should demonstrate:
- Complete 7-step application workflow
- Real `app_prod_*` application ID generation
- SignNow embedded invites with Smart Fields population
- Professional user experience with error handling
- Analytics and monitoring data collection

**Status:** Ready for production deployment pending backend infrastructure completion.