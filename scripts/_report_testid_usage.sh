#!/usr/bin/env bash
set -euo pipefail
ids=("continue-without-signing" "final-submit" "product-card" "success-message" "upload-area")
echo "# TestID Usage (Before/After) — $(date '+%F %T')"
for id in "${ids[@]}"; do
  echo -e "\n## ${id}\n"
  rg -n --no-heading "data-testid=[\"']${id}[\"']|getByTestId\\(['\"]${id}['\"]\\)|byTestId\\(['\"]${id}['\"]\\)|\\[data-testid=['\"]${id}['\"]\\]" client || true
done
