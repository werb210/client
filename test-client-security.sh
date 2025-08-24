#!/bin/bash
# test-client-security.sh - Quick client security verification

BASE="http://localhost:5000"

echo "🔒 Testing Client Security Implementation..."
echo "=============================================="

# Test 1: Health endpoint
echo "1. Testing health endpoint..."
curl -s -o /dev/null -w "HTTP %{http_code}\n" $BASE/api/health

# Test 2: Invalid application data (should be rejected by validation)
echo "2. Testing input validation (invalid data)..."
curl -s -o /dev/null -w "HTTP %{http_code}\n" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}' \
  $BASE/api/public/applications

# Test 3: Valid application structure (should be accepted)
echo "3. Testing valid application structure..."
curl -s -o /dev/null -w "HTTP %{http_code}\n" \
  -H "Content-Type: application/json" \
  -d '{"step4":{"firstName":"Test","lastName":"User","email":"test@example.com","applicantEmail":"test@example.com","phone":"1234567890","applicantPhone":"1234567890"}}' \
  $BASE/api/public/applications

# Test 4: Chat message validation
echo "4. Testing chat message validation..."
curl -s -o /dev/null -w "HTTP %{http_code}\n" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, this is a test message"}' \
  $BASE/api/chat/message

# Test 5: Security headers check
echo "5. Testing security headers..."
curl -s -I $BASE/api/health | grep -E "(X-Frame-Options|X-Content-Type-Options|Content-Security-Policy|Strict-Transport-Security)"

echo ""
echo "🔒 Client security test completed!"
echo "Expected results:"
echo "- Health: 200"
echo "- Invalid data: 422 (validation error)"
echo "- Valid data: 503 (staff API unavailable - expected)"
echo "- Chat: 503 (staff API unavailable - expected)" 
echo "- Headers: Should show security headers"