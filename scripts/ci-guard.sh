#!/usr/bin/env bash
set -euo pipefail

echo "🔎 Guard: secrets & anti-patterns"
! git grep -nE 'admin123|MFA_BYPASS|JWT_SECRET\s*=\s*["'"'"'].*["'"'"']' -- . ':!node_modules' || { echo "❌ Banned string found"; exit 1; }

echo "🔎 Guard: console logs in production code"
! git grep -nE 'console\.(log|error)\(' -- server ':!**/*.test.*' ':!**/*.spec.*' || { echo "❌ console.* in server code"; exit 1; }

echo "🔎 Guard: duplicate basenames"
dups=$(find client/src -type f \( -iname '*.ts' -o -iname '*.tsx' -o -iname '*.js' -o -iname '*.jsx' \) -printf '%f\n' | tr '[:upper:]' '[:lower:]' | sort | uniq -d | wc -l)
[ "$dups" -eq 0 ] || { echo "❌ duplicate basenames detected"; exit 1; }

echo "🔎 Guard: hardcoded credentials"
! git grep -nE '(password|secret|key).*=.*["'"'"'][^$]' -- . ':!node_modules' ':!scripts/' || { echo "❌ Hardcoded credentials found"; exit 1; }

echo "🔎 Guard: debug endpoints"
! git grep -nE '/api/_diag|/debug(?!.*test)' -- server || { echo "❌ Debug endpoints found in production code"; exit 1; }

echo "✅ All security guards passed"