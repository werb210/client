#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT_DIR/client/src"
DIST="$ROOT_DIR/dist/public/assets"
INDEX_HTML="$ROOT_DIR/dist/public/index.html"

pass(){ printf "✅ %s\n" "$1"; }
warn(){ printf "⚠️  %s\n" "$1"; }
fail(){ printf "❌ %s\n" "$1"; exit 1; }

echo "🧪 Client Audit — security + production checks"
echo "ROOT=$ROOT_DIR"

# 0) Build presence
if [[ ! -d "$DIST" ]]; then
  warn "No built assets found at $DIST. Run: npm run build"
  exit 0
fi

echo "— Top asset sizes —"
for file in "$DIST"/*; do
  if [[ -f "$file" ]]; then
    SIZE=$(stat -c%s "$file")
    KB=$(( (SIZE + 1023) / 1024 ))
    printf "%7d KB\t%s\n" "$KB" "$(basename "$file")"
  fi
done | sort -nr | head -20

MAIN_JS=$(ls "$DIST"/index-*.js 2>/dev/null | head -1 || true)
if [[ -n "${MAIN_JS:-}" ]]; then
  MAIN_SIZE=$(stat -c%s "$MAIN_JS")
  KB=$(( (MAIN_SIZE + 1023) / 1024 ))
  if (( KB > 900 )); then
    warn "Main bundle ~${KB}KB exceeds 900KB budget. (OK if heavy pages are lazy.)"
  else
    pass "Main bundle within 900KB budget (~${KB}KB)"
  fi
else
  warn "No index-*.js found (custom build naming?)."
fi

# 1) Dist sanity checks (no localhost/secret artifacts)
BAD_URLS=$(grep -RIlE 'http://(localhost|127\.0\.0\.1)|https?://192\.168\.' "$DIST" || true)
if [[ -n "$BAD_URLS" ]]; then
  warn "Found localhost/dev URLs in dist (likely from test pages):\n$BAD_URLS"
else
  pass "No localhost/dev URLs in dist"
fi

LEAKS=$(grep -RIlE 'OPENAI_API_KEY|SENDGRID_API_KEY|AWS_SECRET|SIGNNOW_' "$DIST" || true)
if [[ -n "$LEAKS" ]]; then
  fail "Found secret-like tokens in dist:\n$LEAKS"
else
  pass "No secret-like tokens in dist"
fi

# 2) Source checks (credentials + lazy loading)
if command -v rg >/dev/null 2>&1; then
  echo "— Source checks (via ripgrep) —"

  # fetch() without credentials: 'include' for same-origin protected calls
  MISSING_CREDS=$(rg -n --no-ignore-vcs 'fetch\([^)]*\)' "$SRC" \
    | rg -v 'credentials:\s*["\x27]include["\x27]' || true)
  if [[ -n "$MISSING_CREDS" ]]; then
    warn "Some fetch() calls lack credentials: 'include' (review if calling protected routes):"
    echo "$MISSING_CREDS" | head -20
  else
    pass "All fetch() calls include credentials (or are public)"
  fi

  # Console logs in prod code (allow tests and explicit debug files)
  NOISY=$(rg -n 'console\.(log|debug)' "$SRC" -g '!**/*.test.*' -g '!**/debug/**' || true)
  if [[ -n "$NOISY" ]]; then
    warn "Console logs present (recommend removing before release):"
    echo "$NOISY" | head -20
  else
    pass "No stray console logs in source"
  fi

  # Verify key lazy loads exist (Step4/5/6, ChatBot)
  if rg -n 'React\.lazy|lazy\(\s*\(\)\s*=>\s*import' "$SRC" | rg -q 'Step4|Step5|Step6|ChatBot'; then
    pass "Heavy components are lazy loaded (Step4/5/6/ChatBot)"
  else
    warn "Could not confirm lazy loading for heavy components (check imports)"
  fi
else
  warn "ripgrep not installed; skipping source checks."
fi

# 3) CSP presence (either meta or served header)
if [[ -f "$INDEX_HTML" ]]; then
  if grep -iq 'http-equiv="Content-Security-Policy"' "$INDEX_HTML"; then
    pass "CSP meta present in index.html (ensure HTTP CSP is set in hosting)"
  else
    warn "No CSP meta in index.html (OK if CSP set as HTTP header by host)"
  fi
fi

# 4) Public API route references in dist (legacy caches)
LEGACY_PUBLIC=$(grep -RIlE '/api/public/' "$DIST" || true)
if [[ -n "$LEGACY_PUBLIC" ]]; then
  warn "Found legacy public API references in dist (likely cached build):"
  echo "$LEGACY_PUBLIC"
else
  pass "No legacy /api/public references in dist"
fi

echo "🏁 Client audit: PASS (warnings do not fail the build)"