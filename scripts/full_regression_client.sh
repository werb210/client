#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +"%Y%m%d-%H%M%S")
OUT="client-regression-$STAMP.md"
echo "# Client Regression Report ($STAMP)" > "$OUT"
section(){ echo -e "\n## $1\n" | tee -a "$OUT"; }

section "Static Audit"
{ bash scripts/static_audit_client.sh; } 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | tee -a "$OUT"

section "Playwright - UI Crawl"
{ npx playwright test tests/ui_crawl_client.spec.ts --reporter=list; } 2>&1 | tee -a "$OUT" || true

section "Playwright - Runtime Guard"
{ npx playwright test tests/runtime_guard_client.spec.ts --reporter=list; } 2>&1 | tee -a "$OUT" || true

echo -e "\n---\nLegend:\n- Any listed duplicates must be 0\n- No console errors, 0 failed network calls\n- No slow API calls (>1.5s)\n" | tee -a "$OUT"
echo "Wrote $OUT"