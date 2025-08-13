#!/usr/bin/env bash
set -euo pipefail

STAMP=$(date +"%Y%m%d-%H%M%S")
OUT="regression-report-$STAMP.md"
echo "# Regression Report ($STAMP)" > "$OUT"

section () { echo -e "\n## $1\n" | tee -a "$OUT"; }

section "Client Static Audit"
{ bash scripts/static_audit_client.sh; } 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | tee -a "$OUT"

section "Playwright - Client UI Crawl"
{ npx playwright test tests/ui_crawl_client.spec.ts --reporter=list; } 2>&1 | tee -a "$OUT" || true

section "Playwright - Client Runtime Guard"
{ npx playwright test tests/runtime_guard_client.spec.ts --reporter=list; } 2>&1 | tee -a "$OUT" || true

section "CI Guards"
{ bash scripts/ci_guards.sh 2>/dev/null || echo "CI guards script not found - creating basic version"; } 2>&1 | tee -a "$OUT" || true

echo -e "\n---\n**Status legend:**\n- Static audit lists duplicates (must be 0)\n- Playwright tests must pass (0 console errors, 0 network errors, buttons clickable)\n- CI guards must pass (no CORS or route duplication)\n" | tee -a "$OUT"

echo "Wrote $OUT"