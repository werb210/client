#!/usr/bin/env bash
set -euo pipefail
echo "=== CLIENT STATIC AUDIT ==="
echo "--- Duplicate data-testid in client/** ---"
rg -No 'data-testid=[\"\x27]([^\"\x27]+)[\"\x27]' client \
 | sed -E 's/.*data-testid=[\"\x27]([^\"\x27]+)[\"\x27].*/\1/' \
 | sort | uniq -d || true

echo "--- Duplicate visible button labels ---"
rg -No '<(Button|button)[^>]*>([^<]{1,120})</\1>' client \
 | sed -E 's/.*>([^<]+)</\1/' | awk '{$1=$1;print}' \
 | sort | uniq -d || true

echo "--- Files with many onClick handlers (top 20) ---"
rg -n --no-heading 'onClick=\{[^}]+\}' client \
 | awk -F: '{print $1}' | sort | uniq -c | sort -nr | head -20
echo "=== DONE (static) ==="
