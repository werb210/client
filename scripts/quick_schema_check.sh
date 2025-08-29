#!/bin/bash
# Quick standalone schema validation - no client app needed
set -euo pipefail

echo "🔍 Quick Staff API Schema Check"
echo "==============================="

# Default to environment or fallback values
VITE_STAFF_API_URL="${VITE_STAFF_API_URL:-https://staff.boreal.financial/api}"
VITE_CLIENT_APP_SHARED_TOKEN="${VITE_CLIENT_APP_SHARED_TOKEN:-}"

if [[ -z "$VITE_CLIENT_APP_SHARED_TOKEN" ]]; then
  echo "❌ VITE_CLIENT_APP_SHARED_TOKEN is required"
  echo "   Set it in your environment or export it before running this script"
  exit 1
fi

echo "✅ Testing: $VITE_STAFF_API_URL/v1/products"
echo ""

node scripts/check_lender_products_schema.js

echo ""
echo "🎯 Schema validation complete!"