#!/usr/bin/env bash
set -euo pipefail

section(){ printf "\n\n========== %s ==========\n" "$1"; }

ROOT_DIR="$(pwd)"
CLIENT_DIR="$ROOT_DIR/client"

############################################
# 0) Stop dev servers (ignore if none)
############################################
section "Stop servers"
pkill -f "tsx .*server"  >/dev/null 2>&1 || true
pkill -f "vite"          >/dev/null 2>&1 || true
pkill -f "node server"   >/dev/null 2>&1 || true
echo "✓ Stopped any running dev servers"

############################################
# 1) Clean rebuild (root + client)
############################################
section "Clean rebuild"
rm -rf node_modules package-lock.json .turbo .vite .parcel-cache .next dist 2>/dev/null || true
if [ -d "$CLIENT_DIR" ]; then
  rm -rf "$CLIENT_DIR/node_modules" "$CLIENT_DIR/dist" 2>/dev/null || true
fi
echo "✓ Cleaned build artifacts"

echo "→ npm ci (root)"
npm ci || npm install

if [ -d "$CLIENT_DIR" ] && [ -f "$CLIENT_DIR/package.json" ]; then
  echo "→ npm ci (client)"
  (cd "$CLIENT_DIR" && npm ci || npm install)
  echo "→ build client"
  (cd "$CLIENT_DIR" && npm run build)
else
  echo "⚠️  client/ not found or missing package.json — skipping client build"
fi

############################################
# 2) Where did index.html end up?
############################################
section "Locate built client"
if [ -f "$ROOT_DIR/dist/public/index.html" ]; then
  echo "✓ dist/public/index.html"
elif [ -f "$CLIENT_DIR/dist/index.html" ]; then
  echo "✓ client/dist/index.html"
else
  echo "❌ No SPA index.html found; check Vite outDir"
fi

############################################
# 3) Duplicate filename check (case-insensitive)
############################################
section "Duplicate filenames (case-insensitive)"
if [ -d "$CLIENT_DIR/src" ]; then
  DUPS=$(find "$CLIENT_DIR/src" -type f \( -iname "*.ts" -o -iname "*.tsx" -o -iname "*.js" -o -iname "*.jsx" \) -printf "%f\n" \
    | tr '[:upper:]' '[:lower:]' | sort | uniq -d)
  if [ -n "${DUPS}" ]; then
    echo "⚠️  Found potential duplicates:"
    echo "$DUPS" | while read -r name; do
      echo "--- $name"
      find "$CLIENT_DIR/src" -type f -iname "$name" -print
    done
  else
    echo "✓ No duplicate basenames detected"
  fi
else
  echo "⚠️  $CLIENT_DIR/src not found"
fi

############################################
# 4) Duplicate package versions (top offenders)
############################################
section "Duplicate package versions"
npm ls --all 2>/dev/null \
| grep -E "── [^@]+@[^ ]+" \
| sed "s/.*── //" \
| awk -F@ '{print tolower($1)"@"$2}' \
| sort | uniq -c | awk '$1>1' | sort -nr | head -30 || true

############################################
# 5) Circular deps (optional)
############################################
section "Circular dependencies (madge)"
npx -y madge --circular --extensions ts,tsx,js,jsx client/src 2>/dev/null || echo "(madge not available or no cycles)"

############################################
# 6) Unused/missing deps (optional)
############################################
section "Unused / Missing deps (depcheck)"
npx -y depcheck || echo "(depcheck not available)"

############################################
# 7) API smoke test (auth + data)
############################################
section "API smoke test"

have_jq(){ command -v jq >/dev/null 2>&1; }

BASE="http://localhost:5000"
EMAIL="${TEST_EMAIL:-test@example.com}"
PASS="${TEST_PASSWORD:-test-password}"

# Try to obtain a token via login (handles MFA-bypass if enabled)
TOKEN="$(curl -s -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | (have_jq && jq -r '.token // empty' || cat))"

# Fallbacks: diagnostic token or locally signed token
if [ -z "$TOKEN" ]; then
  # Try diag endpoint if present
  TOKEN="$(curl -s "$BASE/api/_diag/token" | (have_jq && jq -r '.token // empty' || cat))" || true
fi
if [ -z "$TOKEN" ]; then
  # Last resort: sign a dev token if JWT_SECRET is available
  if [ -n "$JWT_SECRET" ]; then
    TOKEN="$(node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({sub:'test-user',email:'$EMAIL',role:'admin',tenantId:'bf'}, '$JWT_SECRET', {issuer:'bf.staff',audience:'bf.staff.web',expiresIn:'1h'}));" 2>/dev/null || true)"
  fi
fi

if [ -z "$TOKEN" ]; then
  echo "❌ Could not acquire a token. Expect 401s below."
else
  echo "✓ Token acquired: ${TOKEN:0:24}..."
fi

check(){
  local path="$1" expect="$2"
  printf "%-34s" "$path"
  code=$(curl -s -o /tmp/out.json -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE$path" 2>/dev/null || true)
  echo "HTTP $code"
  if [ "$code" = "200" ] && have_jq; then
    case "$expect" in
      lanes)    jq -c '{lanes: (.lanes|length), cards: (.cards|length)}' /tmp/out.json || true ;;
      array)    jq -c 'if type=="array" then {items:length} else . end' /tmp/out.json || true ;;
      settings) jq -c '{users:(.users|length?//0), roles:(.roles|length?//0), integrations:(.integrations|keys?//[]) }' /tmp/out.json || true ;;
      object)   jq -c 'keys' /tmp/out.json || true ;;
      *)        head -c 200 /tmp/out.json || true ;;
    esac
  fi
}

check "/api/pipeline/board"           lanes
check "/api/contacts"                 array
check "/api/v1/lenders"               array
check "/api/v1/lenders/products"      array
check "/api/reports/summary"          object
check "/api/settings/users"           settings
check "/api/settings/roles"           settings
check "/api/settings/integrations"    settings

echo -e "\n✅ Rebuild + duplicate check complete."