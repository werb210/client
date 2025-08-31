#!/usr/bin/env bash
set -euo pipefail

AUDIT_AT="$(date +%F_%H-%M-%S)"
R="reports/client-e2e-$AUDIT_AT"
mkdir -p "$R"

echo "== CLIENT E2E AUDIT @ $AUDIT_AT ==" | tee "$R/00_summary.txt"

# 1) DUPLICATE SCANS (safe, read-only)
echo "STEP 1: Scanning for duplicates..." | tee -a "$R/00_summary.txt"

find client/src -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.js' -o -name '*.mjs' \) \
| sed -E 's/\.(tsx|ts|js|mjs)$//' | sort | uniq -d | tee "$R/10_parallel_ext_bases.txt" >/dev/null || true

find client/src -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.js' -o -name '*.mjs' \) -print0 \
| xargs -0 md5sum | sort | awk 'prev==$1{print} {prev=$1}' | tee "$R/11_hash_dups.txt" >/dev/null || true

grep -r -n --include="*.tsx" --include="*.ts" "export default function" client/src \
| sed -E 's/.*export default function ([A-Za-z0-9_]+)\(.*/\1/' \
| sort | uniq -d | tee "$R/12_component_name_dups.txt" >/dev/null || true

ls -1a | grep -E '^\.env' | tee "$R/13_env_files.txt" >/dev/null || true

echo " - Parallel bases: $(wc -l < "$R/10_parallel_ext_bases.txt" 2>/dev/null || echo 0)" | tee -a "$R/00_summary.txt"
echo " - Hash dup lines: $(wc -l < "$R/11_hash_dups.txt" 2>/dev/null || echo 0)" | tee -a "$R/00_summary.txt"
echo " - Component name dupes: $(wc -l < "$R/12_component_name_dups.txt" 2>/dev/null || echo 0)" | tee -a "$R/00_summary.txt"

# 2) BUILD CHECK (no code changes)
echo "STEP 2: Building client..." | tee -a "$R/00_summary.txt"
if cd client && npm run -s build >/dev/null 2>&1; then
  echo " - Build: PASS" | tee -a "../$R/00_summary.txt"
  cd ..
else
  echo " - Build: FAIL (see $R/20_build_error.txt)" | tee -a "../$R/00_summary.txt"
  cd client && npm run build 2>&1 | tee "../$R/20_build_error.txt"
  cd ..
fi

# 3) API PROBES (counts only)
echo "STEP 3: Probing APIs..." | tee -a "$R/00_summary.txt"
{
  echo "Products: $(curl -s "http://localhost:5000/api/v1/products" | jq 'if type=="array" then length else (.items|length // 0) end' 2>/dev/null || echo "?")"
  echo "Health:   $(curl -s "http://localhost:5000/health" | jq '.status' 2>/dev/null || echo "?")"
} | tee "$R/30_api_counts.txt"

# 4) PLAYWRIGHT TEST — Step 2 clickable + Step 5 uses category
echo "STEP 4: Running Step2→Step5 E2E test..." | tee -a "$R/00_summary.txt"
mkdir -p client/tests && cat > client/tests/step2_step5_e2e.spec.ts <<'TS'
import { test, expect } from '@playwright/test';

test('Step 2 selection persists & Step 5 shows category-driven docs', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bf:intake', JSON.stringify({
      amountRequested: 500000, country: 'CA', industry: 'construction', structure: 'corp'
    }));
    localStorage.removeItem('bf:step2'); localStorage.removeItem('bf:step2:category');
  });
  await page.goto('http://localhost:5000/apply/step-2');
  await page.waitForSelector('[data-step2-card]', { timeout: 10000 });

  // Click a category card/button
  const hit = page.locator('[data-step2-card]').first();
  await hit.click();

  // Verify persistence
  const saved = await page.evaluate(() => ({
    legacy: localStorage.getItem('bf:step2'),
    category: localStorage.getItem('bf:step2:category')
  }));
  expect(saved.legacy || saved.category).toBeTruthy();

  // Navigate to Step 5
  await page.goto('http://localhost:5000/apply/step-5');
  await page.waitForTimeout(1000);

  // Step 5 should show document requirements
  const docCards = page.locator('[data-doc-card]');
  await expect(docCards).toHaveCountGreaterThan(2);
  
  // Should show category-based messaging
  await expect(page.getByText(/Based on your profile.*selected category/i)).toBeVisible();
});
TS

if cd client && npx playwright install --with-deps >/dev/null 2>&1; then
  if npx playwright test tests/step2_step5_e2e.spec.ts --reporter=line >/dev/null 2>&1; then
    echo " - Playwright: PASS" | tee -a "../$R/00_summary.txt"
  else
    echo " - Playwright: FAIL (see $R/40_playwright_output.txt)" | tee -a "../$R/00_summary.txt"
    npx playwright test tests/step2_step5_e2e.spec.ts 2>&1 | tee "../$R/40_playwright_output.txt"
  fi
  cd ..
else
  echo " - Playwright: SKIP (install failed)" | tee -a "$R/00_summary.txt"
  cd ..
fi

echo "== DONE ==" | tee -a "$R/00_summary.txt"
echo "Report saved to: $R/"
cat "$R/00_summary.txt"