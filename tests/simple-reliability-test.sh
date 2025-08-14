#!/bin/bash
set -e

STAMP="$(date +%Y%m%d-%H%M%S)"
REPORTS="reports"
mkdir -p "$REPORTS"

CLIENT_URL="${CLIENT_URL:-http://127.0.0.1:5000}"

echo "== Business Financing PWA Simple Reliability Test =="
echo "Timestamp: $STAMP"
echo "Client URL: $CLIENT_URL"
echo ""

# Test counters
total_tests=0
passed_tests=0

# Test function
test_url() {
    local url="$1"
    local description="$2"
    
    echo -n "Testing $description... "
    total_tests=$((total_tests + 1))
    
    if status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null) && [[ "$status" == "200" ]]; then
        echo "✅ PASS ($status)"
        passed_tests=$((passed_tests + 1))
        return 0
    else
        echo "❌ FAIL ($status)"
        return 1
    fi
}

# Core tests
echo "=== Core Application Routes ==="

test_url "$CLIENT_URL/" "Landing page"
test_url "$CLIENT_URL/dashboard" "Dashboard" 
test_url "$CLIENT_URL/apply/step-1" "Step 1"
test_url "$CLIENT_URL/apply/step-2" "Step 2"
test_url "$CLIENT_URL/apply/step-3" "Step 3"
test_url "$CLIENT_URL/apply/step-4" "Step 4"
test_url "$CLIENT_URL/apply/step-5" "Step 5"
test_url "$CLIENT_URL/apply/step-6" "Step 6"

echo ""
echo "=== PWA Features ==="

test_url "$CLIENT_URL/pwa-test" "PWA Test Page"
test_url "$CLIENT_URL/pwa-diagnostics" "PWA Diagnostics"
test_url "$CLIENT_URL/comprehensive-e2e-test" "E2E Test Page"
test_url "$CLIENT_URL/service-worker.js" "Service Worker"
test_url "$CLIENT_URL/manifest.json" "PWA Manifest"

echo ""
echo "=== Stress Test: Multiple Requests ==="

echo "Sending 10 rapid requests..."
stress_passed=0
for i in {1..10}; do
    if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$CLIENT_URL/" 2>/dev/null | grep -q "200"; then
        stress_passed=$((stress_passed + 1))
    fi
    echo -n "."
done

echo ""
total_tests=$((total_tests + 1))
if [[ $stress_passed -ge 8 ]]; then
    echo "✅ Stress test PASSED ($stress_passed/10)"
    passed_tests=$((passed_tests + 1))
else
    echo "❌ Stress test FAILED ($stress_passed/10)"
fi

echo ""
echo "=== Final Results ==="

if [[ $total_tests -gt 0 ]]; then
    success_rate=$((passed_tests * 100 / total_tests))
    echo "Tests passed: $passed_tests/$total_tests ($success_rate%)"
    
    # Save results
    echo "Business Financing PWA Simple Reliability Test Report - $(date)" > "$REPORTS/simple-reliability-$STAMP.log"
    echo "Tests passed: $passed_tests/$total_tests ($success_rate%)" >> "$REPORTS/simple-reliability-$STAMP.log"
    echo "Report saved to: $REPORTS/simple-reliability-$STAMP.log"
    
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
else
    echo "❌ ERROR: No tests were executed"
    exit 1
fi