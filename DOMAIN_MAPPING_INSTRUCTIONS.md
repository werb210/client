# Custom Domain Setup for Production Deployment

## Current Status
- **Deployment Active**: `https://dfab1952-ea3f-4ab8-a1f0-afc6b34a3c32-00-3fudsxq1yjl2.janeway.replit.dev`
- **Target Domain**: `https://clientportal.boreal.financial`
- **Application**: Ready and serving correctly

## Required Actions

### 1. Replit Domain Configuration
In your Replit deployment settings:

1. **Navigate to Deployment Settings**
   - Go to your deployed app in Replit
   - Click "Settings" or "Configure"
   - Look for "Custom Domain" or "Domain" section

2. **Add Custom Domain**
   - Domain: `clientportal.boreal.financial`
   - Verify domain ownership if required
   - Enable SSL/TLS (should be automatic)

### 2. DNS Configuration (External)
Configure DNS records for `clientportal.boreal.financial`:

**Option A: CNAME Record (Recommended)**
```
Type: CNAME
Name: clientportal
Value: dfab1952-ea3f-4ab8-a1f0-afc6b34a3c32-00-3fudsxq1yjl2.janeway.replit.dev
TTL: 300 (5 minutes)
```

**Option B: A Record**
- Point to Replit's IP address (provided in deployment settings)

### 3. Application Configuration
Current CORS settings already include:
```javascript
allowedOrigins: [
  'https://clientportal.boreal.financial',  // ✅ Already configured
  'https://*.boreal.financial',
  'https://*.replit.dev',
  'https://*.replit.app'
]
```

## Verification Steps

After DNS propagation (5-30 minutes):

1. **Test Domain Access**
   ```bash
   curl -I https://clientportal.boreal.financial
   ```

2. **Verify SSL Certificate**
   - Should show valid SSL certificate for clientportal.boreal.financial

3. **Test Application Flow**
   - Visit https://clientportal.boreal.financial
   - Complete Steps 1-7 application flow
   - Verify all API calls work correctly

## Next Steps

1. **Configure domain in Replit deployment settings**
2. **Update DNS records** (if you control boreal.financial domain)
3. **Wait for propagation** (5-30 minutes)
4. **Test production workflow** at custom domain

## Notes
- Current application is ready and working
- Only domain mapping is required
- No code changes needed (CORS already configured)
- SSL will be automatically provided by Replit