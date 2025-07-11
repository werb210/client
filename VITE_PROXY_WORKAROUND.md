# VITE PROXY WORKAROUND SOLUTION
**Date:** July 11, 2025  
**Issue:** Cannot modify vite.config.ts but need proper API routing  

## Problem Analysis
- **Current Setup:** Client uses `VITE_API_BASE_URL=/api` 
- **Expected Flow:** `fetch('/api/...')` → Vite proxy → Express server
- **Actual Issue:** Vite config lacks proxy configuration 
- **Constraint:** Cannot modify protected vite.config.ts file

## Workaround Strategy

### Option 1: Use Direct Server Port (Recommended)
Update client to call Express server directly on port 5000:

```typescript
// In client/src/constants.ts or similar
export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api'  // Direct to Express in development
  : '/api';                      // Relative path in production
```

### Option 2: Update Environment Configuration
Change VITE_API_BASE_URL to use full localhost URL:

```env
# .env.development
VITE_API_BASE_URL=http://localhost:5000/api
```

### Option 3: Runtime Detection
Use dynamic API base URL based on current environment:

```typescript
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    // Development: Direct to Express server
    return 'http://localhost:5000/api';
  }
  // Production: Use relative path
  return '/api';
};
```

## Implementation Plan

1. **Update constants.ts** to use development-specific API URL
2. **Test browser console** to verify endpoint accessibility  
3. **Run diagnostic tests** to confirm all systems working
4. **Update Replit secret** if needed for production

## Expected Results
- Development: `fetch('http://localhost:5000/api/public/lenders')` ✅
- Production: `fetch('/api/public/lenders')` ✅  
- No CORS issues ✅
- No Vite proxy needed ✅

## Browser Test Command
```javascript
fetch('http://localhost:5000/api/public/lenders')
  .then(r => r.json())
  .then(data => console.log('✅ SUCCESS:', data))
  .catch(e => console.error('❌ FAILED:', e));
```

**Status:** Ready to implement workaround solution