#!/bin/bash
set -e

STAMP="$(date +%Y%m%d-%H%M%S)"
REPORTS="reports"
mkdir -p "$REPORTS"

echo "== Business Financing PWA Master Testing Suite =="
echo "Timestamp: $STAMP"
echo "Comprehensive testing framework execution"
echo ""

# Test suite results
declare -A suite_results

run_test_suite() {
    local suite_name="$1"
    local script_path="$2"
    local timeout_minutes="${3:-15}"
    
    echo "=== Running $suite_name ==="
    
    if [[ -f "$script_path" ]]; then
        local start_time=$(date +%s)
        
        if timeout $((timeout_minutes * 60)) "$script_path"; then
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            suite_results["$suite_name"]="PASSED (${duration}s)"
            echo "✅ $suite_name completed successfully in ${duration}s"
        else
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            suite_results["$suite_name"]="FAILED (${duration}s)"
            echo "❌ $suite_name failed after ${duration}s"
        fi
    else
        suite_results["$suite_name"]="SKIPPED (script not found)"
        echo "⚠️  $suite_name skipped - script not found at $script_path"
    fi
    
    echo ""
}

# Run all test suites
echo "Starting comprehensive testing framework..."
echo ""

run_test_suite "Simple Reliability" "./tests/simple-reliability-test.sh" 5
run_test_suite "Comprehensive Reliability" "./tests/comprehensive-reliability-suite.sh" 10
run_test_suite "Chaos Testing" "./tests/chaos-testing-suite.sh" 8

# Summary report
echo "=== Master Testing Suite Results ==="
total_suites=0
passed_suites=0

{
    echo "Business Financing PWA Master Testing Suite Report"
    echo "================================================="
    echo "Generated: $(date)"
    echo "Execution timestamp: $STAMP"
    echo ""
    echo "Test Suite Results:"
} > "$REPORTS/master-suite-${STAMP}.log"

for suite in "${!suite_results[@]}"; do
    result="${suite_results[$suite]}"
    total_suites=$((total_suites + 1))
    
    echo "  $suite: $result"
    echo "  $suite: $result" >> "$REPORTS/master-suite-${STAMP}.log"
    
    if [[ "$result" == PASSED* ]]; then
        passed_suites=$((passed_suites + 1))
    fi
done

success_rate=$((passed_suites * 100 / total_suites))

echo ""
echo "Overall Results: $passed_suites/$total_suites test suites passed ($success_rate%)"
echo "Master report: $REPORTS/master-suite-${STAMP}.log"

{
    echo ""
    echo "MASTER SUITE SUMMARY"
    echo "==================="
    echo "Suites passed: $passed_suites/$total_suites ($success_rate%)"
    echo "Testing framework: HTTP-based reliability, chaos testing, comprehensive coverage"
    echo "Target application: Business Financing PWA"
    echo "Report generated: $(date)"
} >> "$REPORTS/master-suite-${STAMP}.log"

if [[ $success_rate -eq 100 ]]; then
    echo "🏆 PERFECT: All testing suites passed - application is production-ready"
elif [[ $success_rate -ge 80 ]]; then
    echo "🎉 EXCELLENT: $success_rate% of testing suites passed - application is highly reliable"
elif [[ $success_rate -ge 60 ]]; then
    echo "⚡ GOOD: $success_rate% of testing suites passed - minor issues detected"
else
    echo "🚨 ATTENTION NEEDED: Only $success_rate% of testing suites passed"
fi