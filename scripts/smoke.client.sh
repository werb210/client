#!/usr/bin/env bash
set -euo pipefail
BASE="${VITE_STAFF_API_URL:-https://staff.boreal.financial/api}"
TOK="${VITE_CLIENT_APP_SHARED_TOKEN:-}"

[ -n "$TOK" ] || { echo "❌ VITE_CLIENT_APP_SHARED_TOKEN missing"; exit 1; }

echo "Products (>=44):"
curl -sS -H "Authorization: Bearer $TOK" "$BASE/v1/products" | jq 'length'

echo "Lenders (>=30):"
curl -sS -H "Authorization: Bearer $TOK" "$BASE/lenders" | jq 'length'

echo "Validate (new schema → ok boolean or errors):"
curl -sS -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  -X POST "$BASE/applications/validate-intake" \
  -d '{"business":{"name":"Co"}, "owners":[{"name":"A"}], "amountRequested":50000}' | jq '.'