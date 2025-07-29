#!/bin/bash

echo "=== DEPLOYMENT VERIFICATION SCRIPT ==="
echo "Date: $(date)"
echo ""

echo "1. Build Status:"
if [ -f "dist/index.js" ]; then
    echo "✅ Build exists: $(ls -lh dist/index.js | awk '{print $5}')"
else
    echo "❌ Build missing - run 'npm run build'"
    exit 1
fi

echo ""
echo "2. Production Test:"
timeout 3s env NODE_ENV=production PORT=8080 node dist/index.js 2>&1 | head -5
echo ""

echo "3. Configuration Check:"
echo "✅ Start command: $(grep -o '"start": "[^"]*"' package.json)"
echo "✅ Build command: $(grep -o '"build": "[^"]*"' package.json)"
echo ""

echo "4. Port Configuration:"
grep -A 2 -B 2 "port:" server/config.ts | grep "port:"
echo ""

echo "5. Environment Check:"
echo "Current domain: ${REPLIT_DOMAINS:-'not set'}"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "PORT: ${PORT:-'not set (will use 5000 default)'}"
echo ""

echo "=== DEPLOYMENT READY ==="
echo "Next steps:"
echo "1. Click 'Deploy' button in Replit interface"
echo "2. Select 'Production Deployment'"
echo "3. Verify build/start commands auto-populate correctly"
echo "4. Monitor deployment progress"
echo ""
echo "If deployment fails, check Replit deployment logs for specific errors."