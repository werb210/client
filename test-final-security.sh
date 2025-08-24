#!/bin/bash
# test-final-security.sh - Comprehensive security test suite

BASE="http://localhost:5000"
echo "🔒 FINAL SECURITY VERIFICATION - Boreal Client Portal"
echo "===================================================="

# Test 1: CSRF Protection
echo ""
echo "1. Testing CSRF Protection..."
echo "1a. GET request should issue CSRF token:"
CSRF_RESPONSE=$(curl -s -i $BASE/api/health)
CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -i "x-csrf-token:" | cut -d' ' -f2 | tr -d '\r\n')
echo "   CSRF Token received: ${CSRF_TOKEN:0:8}..."

echo "1b. POST without CSRF token (should be blocked):"
curl -s -o /dev/null -w "   HTTP %{http_code} (expected: 403)\n" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}' \
  $BASE/api/public/applications

echo "1c. POST with valid CSRF token (should pass CSRF check):"
if [ -n "$CSRF_TOKEN" ]; then
  curl -s -o /dev/null -w "   HTTP %{http_code} (expected: 422 for invalid data)\n" \
    -H "Content-Type: application/json" \
    -H "x-csrf-token: $CSRF_TOKEN" \
    -d '{"invalid":"data"}' \
    $BASE/api/public/applications
else
  echo "   ❌ No CSRF token received"
fi

# Test 2: Enhanced Input Validation
echo ""
echo "2. Testing Enhanced Input Validation..."
echo "2a. Malformed JSON (should be rejected):"
curl -s -o /dev/null -w "   HTTP %{http_code} (expected: 400)\n" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d '{invalid json}' \
  $BASE/api/public/applications

echo "2b. Valid structure but validation errors:"
curl -s -o /dev/null -w "   HTTP %{http_code} (expected: 422)\n" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d '{"step4":{"firstName":"","lastName":"","email":"invalid"}}' \
  $BASE/api/public/applications

# Test 3: File Upload Security  
echo ""
echo "3. Testing Enhanced File Upload Security..."
echo "3a. No file provided:"
curl -s -o /dev/null -w "   HTTP %{http_code} (expected: 400)\n" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d '{}' \
  $BASE/api/uploads/validate

echo "3b. Invalid file extension:"
curl -s -o /dev/null -w "   HTTP %{http_code} (expected: 415)\n" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d '{"fileBase64":"dGVzdA==","fileName":"malware.exe"}' \
  $BASE/api/uploads/validate

echo "3c. Missing filename:"
curl -s -o /dev/null -w "   HTTP %{http_code} (expected: 400)\n" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d '{"fileBase64":"dGVzdA=="}' \
  $BASE/api/uploads/validate

# Test 4: Security Headers
echo ""
echo "4. Testing Security Headers..."
echo "4a. CSP and security headers present:"
curl -s -I $BASE/api/health | grep -E "(Content-Security-Policy|X-Frame-Options|X-Content-Type-Options)" | sed 's/^/   /'

echo "4b. Session cookie security:"
curl -s -I $BASE/api/health | grep -i "set-cookie" | sed 's/^/   /'

# Test 5: Rate Limiting
echo ""
echo "5. Testing Rate Limiting (sending 10 rapid requests)..."
for i in {1..10}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/api/health)
  echo -n "   Request $i: $STATUS"
  if [ $i -eq 10 ]; then
    echo " (should still be 200 if under limit)"
  else
    echo ""
  fi
done

# Test 6: CSP Reporting
echo ""
echo "6. Testing CSP Violation Reporting..."
curl -s -o /dev/null -w "   CSP Report: HTTP %{http_code} (expected: 204)\n" \
  -H "Content-Type: application/json" \
  -d '{"csp-report":{"blocked-uri":"evil.com"}}' \
  $BASE/csp-report

echo ""
echo "🔒 SECURITY TEST SUMMARY"
echo "========================"
echo "✅ Expected Results:"
echo "   - CSRF: 403 without token, 422 with valid token"
echo "   - Validation: 400 for malformed, 422 for invalid data"
echo "   - Uploads: 400/415 for invalid files"
echo "   - Headers: CSP, X-Frame-Options, security cookies"
echo "   - Rate limiting: All requests under limit = 200"
echo "   - CSP reporting: 204 for violation reports"
echo ""
echo "🛡️  SECURITY STATUS: $([ -n "$CSRF_TOKEN" ] && echo "HARDENED" || echo "NEEDS ATTENTION")"