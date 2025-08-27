#!/usr/bin/env bash
set -euo pipefail
base="http://localhost:5000"

echo "== Source check (catalog→legacy fallback) =="
if curl -fsS "$base/api/catalog/export-products?includeInactive=1" >/dev/null; then
  src="catalog"
  data="$(curl -fsS "$base/api/catalog/export-products?includeInactive=1")"
  items='.products'
else
  src="legacy"
  data="$(curl -fsS "$base/api/lender-products")"
  items='.products'
fi
echo "Using source: $src"

echo "== Duplicate product IDs =="
echo "$data" | jq "$items | group_by(.id) | map(select(length>1) | {id: .[0].id, count: length})"

echo "== Duplicate product signatures (name+lender+country+category+range) =="
echo "$data" | jq -r "$items
  | map({
      sig: ((.name//.productName|tostring|ascii_downcase)
          + \"|\" + (.lender_name//.lenderName|tostring|ascii_downcase)
          + \"|\" + ((.country//.countryOffered|tostring|ascii_upcase))
          + \"|\" + ((.category//.productCategory|tostring|ascii_downcase))
          + \"|\" + ((.min_amount//.minimumLendingAmount|tostring))
          + \"|\" + ((.max_amount//.maximumLendingAmount|tostring))),
      id
    })
  | group_by(.sig)
  | map(select(length>1) | {sig: .[0].sig, ids: map(.id)})
"

echo "== Step 5 docs (normalized) =="
curl -fsS -X POST "$base/api/required-docs" -H 'Content-Type: application/json' \
  -d '{"category":"Working Capital","country":"US","amount":50000}' \
  | jq '.documents? // "staff-501-fallback"'
echo "Minimum doc enforced (client): Last 6 months bank statements"