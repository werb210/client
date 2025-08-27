#!/usr/bin/env bash
set -euo pipefail
echo "🔎 Finding innerHTML writes…"
rg -n "\.innerHTML\s*=" client/src || true

echo "ℹ️ Where markup is required, replace with SafeHtml or setSafeHtml:"
echo "  // Before: el.innerHTML = html"
echo "  import { setSafeHtml } from '@/lib/safeHtml'"
echo "  setSafeHtml(el, html)"
echo "  // For React render: <SafeHtml html={html} />"