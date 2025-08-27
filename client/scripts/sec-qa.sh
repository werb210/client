#!/usr/bin/env bash
set -euo pipefail
echo "🔒 SECURITY QA"
echo "esbuild version:"
npm ls esbuild | head -n 5
echo
echo "innerHTML occurrences (should be 0 outside safeHtml.tsx):"
rg -n "\binnerHTML\b" client/src | grep -v "safeHtml" || echo "0"
echo
echo "console.* in source (guard + build will mute in prod):"
rg -n "console\.(log|info|debug)\(" client/src | wc -l
echo
echo "Building production…"
npm run build >/dev/null && echo "✅ build ok"
echo "Done."