#!/bin/bash
# CLIENT TOKEN VERIFICATION & STRICT ALIGNMENT CHECK
# Run this after setting VITE_CLIENT_APP_SHARED_TOKEN in Replit Secrets

set -euo pipefail

echo "== CLIENT TOKEN VERIFICATION & STRICT ALIGNMENT =="
echo ""

echo "1. Token Fingerprint Check:"
FP=$(node -e 'const c=require("crypto");const t=process.env.VITE_CLIENT_APP_SHARED_TOKEN||"";process.stdout.write(c.createHash("sha256").update(t).digest("hex").slice(0,12))')
EXPECTED="0944508707a9"

echo "   Current FP: $FP"
echo "   Expected FP: $EXPECTED"

if [ "$FP" = "$EXPECTED" ]; then
    echo "   ✅ Token fingerprint MATCHES!"
else
    echo "   ❌ Token fingerprint mismatch - check Secrets configuration"
    exit 1
fi

echo ""
echo "2. PWA Cache Clear Instructions:"
echo "   Run in browser console to clear service worker cache:"
echo "   navigator.serviceWorker?.getRegistrations?.().then(rs => rs.forEach(r => r.unregister()));"
echo "   caches?.keys?.().then(keys => keys.forEach(k => caches.delete(k)));"
echo "   location.reload(true);"
echo ""

echo "3. STRICT Alignment Check:"
BASE="${VITE_STAFF_API_URL:-https://staff.boreal.financial/api}"
TOK="${VITE_CLIENT_APP_SHARED_TOKEN:?VITE_CLIENT_APP_SHARED_TOKEN not set in Secrets}"

echo "   Base URL: $BASE"
echo "   Token Present: Yes"
echo ""

PRODS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOK" "$BASE/v1/products" 2>/dev/null || echo "000")
LENDS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOK" "$BASE/lenders" 2>/dev/null || echo "000")
REQDOCS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOK" "$BASE/required-docs" 2>/dev/null || echo "000")

echo "   products: $PRODS"
echo "   lenders : $LENDS" 
echo "   reqdocs : $REQDOCS"
echo ""

if [ "$PRODS" = "200" ] && [ "$LENDS" = "200" ] && [ "$REQDOCS" = "200" ]; then
    echo "✅ MODE: STRICT - Full alignment achieved!"
    echo "✅ CLIENT: Ready for production deployment"
else
    echo "⚠️  MODE: TOKEN_ONLY (will auto-switch to STRICT when Staff deploys)"
    if [ "$REQDOCS" = "404" ]; then
        echo "   ℹ️  required-docs 404 is expected until Staff deployment"
    fi
fi

echo ""
echo "== VERIFICATION COMPLETE =="