#!/usr/bin/env bash
set -e
echo "== Catalog (expects 200 via legacy fallback) =="; curl -sS /api/lender-products | jq '.products|length'
echo "== Recommendations (US $100k) =="; node -e 'import("./src/lib/api.ts").then(async m=>console.log((await m.recommendProducts({amount:100000,country:"US"})).map(x=>[x.category,x.products.length])))'
echo "== Docs fallback =="; curl -sS -X POST /api/required-docs -H 'Content-Type: application/json' -d '{"category":"Working Capital"}' | jq '.status? // "fallback"'