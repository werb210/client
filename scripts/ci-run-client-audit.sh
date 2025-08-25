#!/usr/bin/env bash
set -euo pipefail
echo "🛡️ CI: building client and running strict audit…"
# Build; if your build command differs, adjust here.
npm run build || (echo "Build failed." && exit 1)
# Strict mode will fail on warnings
AUDIT_STRICT=1 bash scripts/client-audit.sh