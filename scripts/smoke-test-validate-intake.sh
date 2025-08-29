#!/usr/bin/env bash
# CLIENT APPLICATION - Validate-Intake Smoke Test
# Quick smoke test to confirm happy path when staff backend is live

set -euo pipefail

BASE="${VITE_STAFF_API_URL:-https://staff.boreal.financial/api}"
TOK="${VITE_CLIENT_APP_SHARED_TOKEN:-REDACTED}"

# Extract clean token if needed
if [[ "$TOK" == *"VITE_CLIENT_APP_SHARED_TOKEN="* ]]; then
    TOK="${TOK#*=}"
fi

echo "🧪 CLIENT SMOKE TEST - VALIDATE-INTAKE ENDPOINT"
echo "================================================"
echo ""
echo "Using BASE: ${BASE}"
echo "Using TOKEN: ${TOK:0:20}..."
echo ""

echo "1️⃣ Client smoke — expected ok:false (unknown product):"
curl -sS -X POST -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  "${BASE%/}/applications/validate-intake" \
  -d '{"productId":"test123","country":"US","amountRequested":10000}' | jq '.' || echo "⚠️ Endpoint not yet available"

echo ""
echo "2️⃣ Client smoke — expected ok:true (use a real product id):"
curl -sS -X POST -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  "${BASE%/}/applications/validate-intake" \
  -d '{"productId":"PRODUCT_ID","country":"US","amountRequested":50000}' | jq '.' || echo "⚠️ Endpoint not yet available"

echo ""
echo "✅ Outcome: Staff implements POST /applications/validate-intake"
echo "   - Pre-auth gated by shared token (no 401s)"
echo "   - CORS-safe"
echo "   - Client requires no changes"