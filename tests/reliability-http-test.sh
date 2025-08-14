#!/bin/bash
set -euo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"
REPORTS="reports"
mkdir -p "$REPORTS"

CLIENT_URL="${CLIENT_URL:-http://127.0.0.1:5000}"
STAFF_URL="${STAFF_URL:-http://127.0.0.1:5000}"

echo "== Business Financing PWA HTTP Reliability Tests =="
echo "Timestamp: $STAMP"
echo "Client URL: $CLIENT_URL"
echo "Staff URL: $STAFF_URL"
echo ""

# Function to test HTTP endpoint
test_endpoint() {
    local url="$1"
    local description="$2"
    local expected_status="${3:-200}"
    
    echo -n "Testing $description... "
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    
    if [[ "$status_code" == "$expected_status" ]]; then
        echo "✅ PASS ($status_code)"
        return 0
    else
        echo "❌ FAIL ($status_code, expected $expected_status)"
        return 1
    fi
}

# Function to test endpoint with content check
test_endpoint_content() {
    local url="$1"
    local description="$2"
    local content_check="$3"
    
    echo -n "Testing $description... "
    
    local response
    response=$(curl -s --max-time 10 "$url" 2>/dev/null || echo "CURL_ERROR")
    
    if [[ "$response" == "CURL_ERROR" ]]; then
        echo "❌ FAIL (Connection error)"
        return 1
    elif [[ "$response" =~ $content_check ]]; then
        echo "✅ PASS (Content found)"
        return 0
    else
        echo "❌ FAIL (Content not found)"
        return 1
    fi
}

# Test counters
total_tests=0
passed_tests=0

# Main application routes
echo "=== Core Application Routes ==="

tests=(
    "$CLIENT_URL|Landing page|financing"
    "$CLIENT_URL/dashboard|Dashboard|dashboard|application"
    "$CLIENT_URL/apply/step-1|Step 1|Step|Financial"
    "$CLIENT_URL/apply/step-2|Step 2|Step|Recommendation"
    "$CLIENT_URL/apply/step-3|Step 3|Step|Business"
    "$CLIENT_URL/apply/step-4|Step 4|Step|Applicant"
    "$CLIENT_URL/apply/step-5|Step 5|Step|Document"
    "$CLIENT_URL/apply/step-6|Step 6|Step|Sign"
)

for test in "${tests[@]}"; do
    IFS='|' read -ra parts <<< "$test"
    url="${parts[0]}"
    description="${parts[1]}"
    content_pattern="${parts[2]}"
    
    ((total_tests++))
    if test_endpoint_content "$url" "$description" "$content_pattern"; then
        ((passed_tests++))
    fi
done

echo ""
echo "=== PWA and Diagnostic Routes ==="

pwa_tests=(
    "$CLIENT_URL/pwa-test|PWA Test Page|PWA"
    "$CLIENT_URL/pwa-diagnostics|PWA Diagnostics|diagnostic"
    "$CLIENT_URL/comprehensive-e2e-test|E2E Test Page|test|comprehensive"
    "$CLIENT_URL/chatbot-ai-test|Chatbot Test|chatbot|chat"
)

for test in "${pwa_tests[@]}"; do
    IFS='|' read -ra parts <<< "$test"
    url="${parts[0]}"
    description="${parts[1]}"  
    content_pattern="${parts[2]}"
    
    ((total_tests++))
    if test_endpoint_content "$url" "$description" "$content_pattern"; then
        ((passed_tests++))
    fi
done

echo ""
echo "=== Service Worker and Manifest Tests ==="

service_tests=(
    "$CLIENT_URL/service-worker.js|Service Worker|ServiceWorker|Worker"
    "$CLIENT_URL/manifest.json|PWA Manifest|name|manifest"
)

for test in "${service_tests[@]}"; do
    IFS='|' read -ra parts <<< "$test"
    url="${parts[0]}"
    description="${parts[1]}"
    content_pattern="${parts[2]}"
    
    ((total_tests++))
    if test_endpoint_content "$url" "$description" "$content_pattern"; then
        ((passed_tests++))
    fi
done

echo ""
echo "=== Stress Test: Multiple Rapid Requests ==="

stress_url="$CLIENT_URL/"
echo "Sending 20 rapid requests to landing page..."

stress_passed=0
for i in {1..20}; do
    if test_endpoint "$stress_url" "Stress test #$i" "200" >/dev/null 2>&1; then
        ((stress_passed++))
    fi
    echo -n "."
done

echo ""
echo "Stress test result: $stress_passed/20 requests succeeded"

if [[ $stress_passed -ge 18 ]]; then
    echo "✅ Stress test PASSED (≥18/20 success rate)"
    ((passed_tests++))
else
    echo "❌ Stress test FAILED (<18/20 success rate)"
fi
((total_tests++))

echo ""
echo "=== Final Results ==="
success_rate=$(( (passed_tests * 100) / total_tests ))

echo "Tests passed: $passed_tests/$total_tests ($success_rate%)"
echo "Report saved to: $REPORTS/http-reliability-$STAMP.log"

# Save detailed results
{
    echo "Business Financing PWA HTTP Reliability Test Report"
    echo "Generated: $(date)"
    echo "Client URL: $CLIENT_URL"
    echo "Staff URL: $STAFF_URL"
    echo ""
    echo "Results: $passed_tests/$total_tests tests passed ($success_rate%)"
    echo ""
    echo "Test Details:"
    echo "- Core application routes: Landing, dashboard, 6 application steps"
    echo "- PWA features: Service worker, manifest, diagnostics"  
    echo "- Stress testing: 20 rapid requests to verify stability"
    echo ""
} > "$REPORTS/http-reliability-$STAMP.log"

if [[ $success_rate -ge 90 ]]; then
    echo "🎉 EXCELLENT: Application reliability is $success_rate%"
    exit 0
elif [[ $success_rate -ge 75 ]]; then
    echo "⚠️  GOOD: Application reliability is $success_rate%"
    exit 0
else
    echo "🚨 NEEDS ATTENTION: Application reliability is only $success_rate%"
    exit 1
fi