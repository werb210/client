#!/usr/bin/env bash
set -euo pipefail
echo "🔐 Security QA…"

echo "1) esbuild version (should be >= 0.24.3):"
npm ls esbuild || true

echo "2) Build (terser should strip console.*):"
npm run build >/dev/null 2>&1 || (echo "❌ build failed" && exit 1)
COUNT=$(rg -o "console\.(log|info|debug)\(" dist -n | wc -l | tr -d ' ')
echo "   console.* in dist: ${COUNT}"
test "${COUNT}" -eq 0 && echo "   ✅ no console leaks" || echo "   ❌ console calls remain"

echo "3) innerHTML scan (should be 0 remaining):"
IH=$(rg -n "\binnerHTML\b" client/src | wc -l | tr -d ' ')
echo "   innerHTML refs: ${IH}"
test "${IH}" -eq 0 && echo "   ✅ no unsafe innerHTML" || echo "   ❌ replace remaining with safeHtml helpers"

echo "4) Quick runtime smoke (optional):"
node -e "console.log('PROD?', process.env.NODE_ENV||'n/a')"
echo "✅ QA complete"