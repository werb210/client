#!/usr/bin/env bash
set -euo pipefail
echo "=== CLIENT STATIC AUDIT ==="
echo "--- Duplicate data-testid in client/** and tests/** ---"
rg -No 'data-testid=[\"\x27]([^\"\x27]+)[\"\x27]' client tests \
 | sed -E 's/.*data-testid=[\"\x27]([^\"\x27]+)[\"\x27].*/\1/' \
 | sort | uniq -d || true

echo "--- Duplicate visible button labels ---"
rg -No '<(Button|button)[^>]*>([^<]{1,120})</\1>' client \
 | sed -E 's/.*>([^<]+)</\1/' | awk '{$1=$1;print}' \
 | sort | uniq -d || true
