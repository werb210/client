#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-http://localhost:5000}"

say() { printf "\n\033[1m%s\033[0m\n" "$*"; }
pass(){ echo "✅ $*"; }
fail(){ echo "❌ $*"; exit 1; }

say "1) Version + health"
curl -fsS "$BASE/__version" && pass "__version"
curl -fsS "$BASE/api/health"  && pass "health"

say "2) Public intake -> UUID -> card API"
APP_JSON=$(curl -fsS -X POST "$BASE/api/public/applications" \
  -H 'Content-Type: application/json' \
  -d '{"businessInformation":{"legalBusinessName":"SMOKE CORP"},
       "applicantInformation":{"firstName":"Smoke","lastName":"Test","email":"smoke@test.com"},
       "finance":{"requestedAmount":123000}}')
APP_ID=$(echo "$APP_JSON" | jq -r .applicationId)
[[ "$APP_ID" =~ ^[0-9a-f-]{36}$ ]] || fail "Invalid applicationId: $APP_ID"
pass "Public application created: $APP_ID"

CARD=$(curl -fsS "$BASE/api/pipeline/cards/$APP_ID/application")
BN=$(echo "$CARD" | jq -r '.application.businessName')
[[ "$BN" != "null" && -n "$BN" ]] || fail "Card API missing businessName"
pass "Card API has businessName: $BN"

say "3) Documents pipeline (presign -> upload -> list)"
PS=$(curl -fsS -X POST "$BASE/api/documents/presign" \
  -H 'Content-Type: application/json' \
  -d "{\"applicationId\":\"$APP_ID\",\"fileName\":\"bank.pdf\",\"contentType\":\"application/pdf\"}")
URL=$(echo "$PS" | jq -r .url); [[ "$URL" == http* ]] || fail "No presign URL"

# tiny test file
echo "%PDF-1.4 test" > /tmp/bank.pdf
curl -fsS -X PUT -H 'Content-Type: application/pdf' --data-binary @/tmp/bank.pdf "$URL" && pass "Uploaded to S3"

LIST=$(curl -fsS "$BASE/api/documents/$APP_ID")
COUNT=$(echo "$LIST" | jq '.items | length')
[[ "$COUNT" -ge 1 ]] && pass "Documents listed ($COUNT)" || fail "No documents listed"

say "4) Communications sanity"
# endpoints should exist (even if auth-protected they must 401, not 404/500)
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/support/issues" | grep -Eq '200|401' || fail "/api/support/issues not mounted"
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/voice/mailboxes" | grep -Eq '200|401' || fail "/api/voice/mailboxes not mounted"
pass "Comms routes mounted"

say "5) AI/chat handshake"
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/chat/handshake" | grep -Eq '200|401' && pass "chat/handshake reachable" || fail "chat/handshake missing"

say "ALL CHECKS PASSED"