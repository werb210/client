#!/bin/bash
set -euo pipefail

echo "🔧 LENDER PRODUCTS VALIDATION SUITE"
echo "===================================="

# Check environment variables
if [[ -z "${VITE_STAFF_API_URL:-}" ]]; then
  echo "❌ VITE_STAFF_API_URL is required"
  exit 1
fi

if [[ -z "${VITE_CLIENT_APP_SHARED_TOKEN:-}" ]]; then
  echo "❌ VITE_CLIENT_APP_SHARED_TOKEN is required"
  exit 1
fi

echo "✅ Environment configured:"
echo "   API: $VITE_STAFF_API_URL"
echo "   Token: ${VITE_CLIENT_APP_SHARED_TOKEN:0:8}..."
echo ""

# Step 1: API Schema Validation
echo "📋 1) Validating Staff API schema..."
node scripts/check_lender_products_schema.js
echo "✅ API schema validation passed"
echo ""

# Step 2: Start client app for hook testing
echo "🚀 2) Starting client app (detached)..."
npm run dev > /dev/null 2>&1 &
CLIENT_PID=$!
echo "   Client PID: $CLIENT_PID"

# Wait for client to start
echo "⏳ Waiting for client startup..."
sleep 5

# Step 3: Run Playwright tests
echo "🧪 3) Running Playwright validation tests..."
VITE_AUDIT=1 \
CLIENT_URL=http://localhost:5000 \
npx playwright test tests/products.sync.spec.ts tests/reco.engine.spec.ts --reporter=list

echo ""
echo "🎯 4) Cleaning up..."
kill $CLIENT_PID 2>/dev/null || true
echo "✅ Client app stopped"

echo ""
echo "🎉 VALIDATION SUITE COMPLETE"
echo "All tests passed! Lender products system is validated."