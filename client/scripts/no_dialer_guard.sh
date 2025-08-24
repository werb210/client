#!/usr/bin/env bash
set -euo pipefail
grep -rn "dialer\|Open Dialer\|Slide-?in\|Twilio.*\(call\|voice\)" client/src 2>/dev/null && {
  echo "❌ Dialer references found in CLIENT app. Dialer is staff-only."
  exit 1
}
echo "✅ Client app free of dialer code."