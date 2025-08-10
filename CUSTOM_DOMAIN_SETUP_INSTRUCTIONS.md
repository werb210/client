# Custom Domain Setup for Boreal Financial Client Portal
**Date:** August 10, 2025  
**Application:** Boreal Financial Client Portal  
**Current Domain:** clientportal.boreal.financial (based on your existing configuration)

## Setup Instructions

### Step 1: Deploy to Production First
1. **Click the "Deploy" button** in your Replit interface
2. **Wait for initial deployment** to complete (usually 2-5 minutes)
3. **Verify deployment** works with the temporary Replit URL

### Step 2: Configure Custom Domain in Replit
1. **Navigate to Deployments tab** in your Replit App
2. **Click on your deployment** (once it's created)
3. **Go to Settings tab** within the deployment
4. **Click "Link a domain"** or **"Manually connect from another registrar"**
5. **Enter your custom domain:** `clientportal.boreal.financial`

### Step 3: DNS Configuration
Replit will provide you with DNS records to add to your domain registrar:

**A Record:**
```
Type: A
Name: clientportal (or @ if using root domain)
Value: [IP address provided by Replit]
TTL: 300 (or default)
```

**TXT Record (for verification):**
```
Type: TXT
Name: _replit-challenge.clientportal
Value: [verification token provided by Replit]
TTL: 300 (or default)
```

### Step 4: Add DNS Records
1. **Log into your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)
2. **Navigate to DNS Management** for boreal.financial
3. **Add the A record** for clientportal subdomain
4. **Add the TXT record** for domain verification
5. **Save changes**

### Step 5: Verification
1. **Wait for DNS propagation** (can take up to 48 hours, usually 15-30 minutes)
2. **Return to Replit deployment settings**
3. **Click "Verify"** to confirm domain configuration
4. **Test your custom domain** once verified

## Current Configuration Status

Your application is already configured for production deployment:

✅ **Deployment Target:** Autoscale (supports custom domains)  
✅ **Build Command:** `npm run build`  
✅ **Start Command:** `npm run start`  
✅ **Port Configuration:** Port 5000 → External port 80  
✅ **Production Ready:** All features tested and operational  

## Expected Final URLs

Once configured, your app will be accessible at:
- **Primary:** https://clientportal.boreal.financial
- **Automatic HTTPS:** SSL certificate provided by Replit
- **Global CDN:** Worldwide fast access

## Benefits of Custom Domain

✅ **Professional Branding:** Uses your boreal.financial domain  
✅ **SEO Optimization:** Better search engine indexing  
✅ **User Trust:** Familiar domain increases user confidence  
✅ **SSL Certificate:** Automatic HTTPS encryption  
✅ **PWA Compatibility:** Required for full Progressive Web App features  

## Troubleshooting

**If domain verification fails:**
1. Check DNS records are exactly as provided by Replit
2. Wait longer for DNS propagation (up to 48 hours)
3. Use DNS checker tools to verify propagation
4. Contact your domain registrar if issues persist

**If SSL certificate issues:**
1. Ensure A record points to correct IP
2. Wait for automatic certificate provisioning (5-10 minutes)
3. Force refresh browser cache

## Next Steps

1. **Deploy first** using the Deploy button
2. **Configure domain** following steps above
3. **Test production deployment** thoroughly
4. **Update any external integrations** to use new domain

Your Boreal Financial Client Portal will then be live at your custom domain with full production features!