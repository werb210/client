#!/usr/bin/env bash
set -euo pipefail
echo "=== CLIENT STATIC AUDIT ==="
echo "--- Duplicate data-testid values (client/**) ---"
rg -No 'data-testid=[\"\x27]([^\"\x27]+)[\"\x27]' client | sed -E 's/.*data-testid=[\"\x27]([^\"\x27]+)[\"\x27].*/\1/' | sort | uniq -d || true
echo "--- Suspicious repeated labels ---"
rg -No '<(Button|button|MenuItem|Tab)[^>]*>([^<]{1,60})</' client | sed -E 's/.*>([^<]+)</\1/' | awk '{$1=$1;print}' | sort | uniq -d || true
echo "--- Multiple onClick handlers per file ---"
rg -n --no-heading 'onClick=\{[^}]+\}' client | awk -F: '{print $1}' | sort | uniq -c | sort -nr | head -20
echo "=== DONE (static) ==="