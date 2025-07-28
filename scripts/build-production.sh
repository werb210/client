#!/bin/bash

# Production Build Script - Ensures no development banner
echo "Building for production deployment..."

# Set environment variables to force production mode
export NODE_ENV=production
export REPLIT_ENVIRONMENT=production

# Run the build
npm run build

# Remove development banner from built HTML if it exists
sed -i '/replit-dev-banner/d' dist/public/index.html
# Also remove any remaining comment references
sed -i '/This is a replit script which adds a banner/d' dist/public/index.html

# Verify banner is removed
if grep -q "replit-dev-banner" dist/public/index.html; then
  echo "❌ Development banner still present in build"
  exit 1
else
  echo "✅ Production build completed - no development banner"
fi

echo "Production build ready for deployment"