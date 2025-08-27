#!/usr/bin/env bash
set -euo pipefail
rg -n "\.innerHTML\s*=" client/src || true
echo "➡ Replace raw innerHTML with setSafeHtml() or <SafeHtml html={...} />"