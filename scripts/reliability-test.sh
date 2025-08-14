#!/bin/bash
set -euo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"
REPORTS="reports"
mkdir -p "$REPORTS" tests/e2e

# Ensure Playwright is installed and ready
npm i -D @playwright/test playwright >/dev/null 2>&1 || true
npx playwright install --with-deps >/dev/null 2>&1 || true

echo "== Starting Business Financing PWA Reliability Tests =="
echo "Timestamp: $STAMP"
echo "Testing routes: /, /dashboard, /apply/step-1 through /apply/step-6"
echo "PWA features: Offline capability, service worker, application stability"
echo ""

# Run the reliability tests
CLIENT_URL="${CLIENT_URL:-http://127.0.0.1:5000}" STAFF_URL="${STAFF_URL:-http://127.0.0.1:5000}" \
  npx playwright test \
  tests/e2e/full_flow_soak.spec.ts \
  tests/e2e/network_flake.spec.ts \
  tests/e2e/application_stability.spec.ts \
  --reporter=list | tee "$REPORTS/client-reliability-${STAMP}.log" || true

echo ""
echo "== Test Summary =="
echo "• Client reliability log: reports/client-reliability-${STAMP}.log"
echo "• Tests completed at: $(date)"
echo "• Coverage: Landing page, dashboard, application steps, PWA offline features"
echo ""