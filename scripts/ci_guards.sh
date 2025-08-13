#!/usr/bin/env bash
set -euo pipefail
echo "=== CI GUARDS ==="

echo "--- CORS duplications ---"
rg -n "cors\(\)|app\.use.*cors|Access-Control" server/ || echo "No CORS implementations found"

echo "--- Express route duplications ---"
rg -n "app\.(get|post|put|delete|patch)" server/ | awk -F: '{print $3}' | sort | uniq -d || echo "No duplicate routes found"

echo "--- Missing environment checks ---"
rg -n "process\.env\." server/ | grep -v "NODE_ENV\|PORT" | head -10 || echo "Environment variables usage found"

echo "=== DONE (ci_guards) ==="