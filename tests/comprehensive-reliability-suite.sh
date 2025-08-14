#!/bin/bash
set -e

STAMP="$(date +%Y%m%d-%H%M%S)"
REPORTS="reports"
mkdir -p "$REPORTS"

CLIENT_URL="${CLIENT_URL:-http://127.0.0.1:5000}"
LOG_FILE="$REPORTS/comprehensive-reliability-$STAMP.log"

echo "== Business Financing PWA Comprehensive Reliability Suite =="
echo "Timestamp: $STAMP"
echo "Client URL: $CLIENT_URL"
echo "Full report: $LOG_FILE"
echo ""

# Initialize log file
{
    echo "Business Financing PWA Comprehensive Reliability Test Suite"
    echo "========================================================="
    echo "Generated: $(date)"
    echo "Client URL: $CLIENT_URL"
    echo ""
} > "$LOG_FILE"

# Test counters
total_tests=0
passed_tests=0
category_results=()

# Enhanced test function with detailed logging
test_endpoint() {
    local url="$1"
    local description="$2"
    local expected_content="$3"
    
    echo -n "Testing $description... "
    total_tests=$((total_tests + 1))
    
    # Test HTTP status
    local status_code
    local response_time
    local content
    
    start_time=$(date +%s.%3N)
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url" 2>/dev/null || echo "000")
    end_time=$(date +%s.%3N)
    response_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
    
    # Get content if status is 200
    if [[ "$status_code" == "200" ]]; then
        content=$(curl -s --max-time 10 "$url" 2>/dev/null || echo "")
    fi
    
    # Log detailed results
    {
        echo "Test: $description"
        echo "URL: $url" 
        echo "Status: $status_code"
        echo "Response Time: ${response_time}s"
        echo "Content Length: ${#content} chars"
        echo "Expected Content: $expected_content"
        echo ""
    } >> "$LOG_FILE"
    
    if [[ "$status_code" == "200" ]] && [[ -n "$expected_content" ]] && echo "$content" | grep -qi "$expected_content"; then
        echo "✅ PASS ($status_code, ${response_time}s)"
        passed_tests=$((passed_tests + 1))
        return 0
    elif [[ "$status_code" == "200" ]] && [[ -z "$expected_content" ]]; then
        echo "✅ PASS ($status_code, ${response_time}s)"
        passed_tests=$((passed_tests + 1))
        return 0
    else
        echo "❌ FAIL ($status_code, ${response_time}s)"
        return 1
    fi
}

# Run test category
run_category() {
    local category_name="$1"
    local category_passed=0
    local category_total=0
    
    echo "=== $category_name ==="
    echo "" >> "$LOG_FILE"
    echo "$category_name" >> "$LOG_FILE"
    echo "$(echo "$category_name" | sed 's/./=/g')" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    case "$category_name" in
        "Core Application Routes")
            test_endpoint "$CLIENT_URL/" "Landing Page" "financing" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/dashboard" "Dashboard" "Boreal Financial" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/apply/step-1" "Step 1 - Financial Profile" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/apply/step-2" "Step 2 - Recommendations" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/apply/step-3" "Step 3 - Business Details" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/apply/step-4" "Step 4 - Applicant Info" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/apply/step-5" "Step 5 - Document Upload" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/apply/step-6" "Step 6 - Signature" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            ;;
        "PWA Features")
            test_endpoint "$CLIENT_URL/service-worker.js" "Service Worker" "CACHE_NAME" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/manifest.json" "PWA Manifest" "name" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/pwa-test" "PWA Test Page" "PWA" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/pwa-diagnostics" "PWA Diagnostics" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            ;;
        "Testing & Diagnostics")
            test_endpoint "$CLIENT_URL/comprehensive-e2e-test" "E2E Test Page" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/chatbot-ai-test" "Chatbot Test" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/api-test" "API Test" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            ;;
        "Support Pages")
            test_endpoint "$CLIENT_URL/faq" "FAQ Page" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/troubleshooting" "Troubleshooting" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/privacy-policy" "Privacy Policy" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            test_endpoint "$CLIENT_URL/terms-of-service" "Terms of Service" "" && category_passed=$((category_passed + 1)); category_total=$((category_total + 1))
            ;;
    esac
    
    local category_rate=$((category_passed * 100 / category_total))
    category_results+=("$category_name: $category_passed/$category_total ($category_rate%)")
    echo "Category Result: $category_passed/$category_total tests passed ($category_rate%)"
    echo ""
    
    echo "Category Result: $category_passed/$category_total tests passed ($category_rate%)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# Performance stress test
performance_test() {
    echo "=== Performance & Load Testing ==="
    echo "" >> "$LOG_FILE"
    echo "Performance & Load Testing" >> "$LOG_FILE"
    echo "=========================" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    # Rapid fire test
    echo "Rapid fire test: 20 requests in quick succession..."
    local rapid_passed=0
    local total_time=0
    
    for i in {1..20}; do
        start=$(date +%s.%3N)
        if status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$CLIENT_URL/" 2>/dev/null) && [[ "$status" == "200" ]]; then
            rapid_passed=$((rapid_passed + 1))
        fi
        end=$(date +%s.%3N)
        time_diff=$(echo "$end - $start" | bc -l 2>/dev/null || echo "0")
        total_time=$(echo "$total_time + $time_diff" | bc -l 2>/dev/null || echo "$total_time")
        echo -n "."
    done
    
    echo ""
    local avg_time=$(echo "scale=3; $total_time / 20" | bc -l 2>/dev/null || echo "0")
    echo "Results: $rapid_passed/20 requests succeeded"
    echo "Average response time: ${avg_time}s"
    
    echo "Rapid fire test: $rapid_passed/20 requests succeeded" >> "$LOG_FILE"
    echo "Average response time: ${avg_time}s" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    total_tests=$((total_tests + 1))
    if [[ $rapid_passed -ge 18 ]]; then
        echo "✅ Performance test PASSED"
        passed_tests=$((passed_tests + 1))
    else
        echo "❌ Performance test FAILED"
    fi
    echo ""
}

# Run all test categories
run_category "Core Application Routes"
run_category "PWA Features" 
run_category "Testing & Diagnostics"
run_category "Support Pages"
performance_test

# Final results
echo "=== Final Comprehensive Results ==="
success_rate=$((passed_tests * 100 / total_tests))

echo "Overall Results:"
echo "Tests passed: $passed_tests/$total_tests ($success_rate%)"
echo ""

echo "Category Breakdown:" 
for result in "${category_results[@]}"; do
    echo "  $result"
done

echo ""
echo "Report Details:"
echo "  Full log: $LOG_FILE"
echo "  Timestamp: $STAMP"
echo "  Environment: Business Financing PWA"

# Final assessment
{
    echo ""
    echo "FINAL ASSESSMENT"
    echo "==============="
    echo "Overall Success Rate: $success_rate%"
    echo "Total Tests: $total_tests"
    echo "Passed Tests: $passed_tests"
    echo "Failed Tests: $((total_tests - passed_tests))"
    echo ""
    echo "Category Results:"
    for result in "${category_results[@]}"; do
        echo "  $result"
    done
    echo ""
} >> "$LOG_FILE"

if [[ $success_rate -ge 95 ]]; then
    echo "🎉 EXCELLENT: Application reliability is $success_rate% - Production ready!"
    exit 0
elif [[ $success_rate -ge 85 ]]; then
    echo "⚡ VERY GOOD: Application reliability is $success_rate% - Minor issues detected"
    exit 0  
elif [[ $success_rate -ge 70 ]]; then
    echo "⚠️  GOOD: Application reliability is $success_rate% - Some issues need attention"
    exit 0
else
    echo "🚨 CRITICAL: Application reliability is only $success_rate% - Immediate attention required"
    exit 1
fi