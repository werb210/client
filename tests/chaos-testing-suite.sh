#!/bin/bash
set -e

STAMP="$(date +%Y%m%d-%H%M%S)"
REPORTS="reports"
mkdir -p "$REPORTS"

CLIENT_URL="${CLIENT_URL:-http://127.0.0.1:5000}"
CHAOS_MINUTES="${CHAOS_MINUTES:-10}"

echo "== Business Financing PWA Chaos Testing Suite =="
echo "Timestamp: $STAMP"
echo "Duration: $CHAOS_MINUTES minutes"
echo "Target: Stress test application stability under chaotic conditions"
echo ""

# Test counters
total_chaos_tests=0
passed_chaos_tests=0

log_file="$REPORTS/chaos-testing-${STAMP}.log"

{
    echo "Business Financing PWA Chaos Testing Suite"
    echo "=========================================="
    echo "Generated: $(date)"
    echo "Duration: $CHAOS_MINUTES minutes"
    echo "Client URL: $CLIENT_URL"
    echo ""
} > "$log_file"

# Chaos test function
chaos_test() {
    local test_name="$1"
    local test_function="$2"
    
    echo "Running $test_name..."
    total_chaos_tests=$((total_chaos_tests + 1))
    
    if $test_function; then
        echo "✅ $test_name PASSED"
        passed_chaos_tests=$((passed_chaos_tests + 1))
        echo "$test_name: PASSED" >> "$log_file"
    else
        echo "❌ $test_name FAILED"
        echo "$test_name: FAILED" >> "$log_file"
    fi
}

# Rapid fire requests test
rapid_fire_test() {
    echo "Sending 50 rapid requests..."
    local success_count=0
    
    for i in {1..50}; do
        if curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$CLIENT_URL/" 2>/dev/null | grep -q "200"; then
            success_count=$((success_count + 1))
        fi
    done
    
    echo "Rapid fire: $success_count/50 requests succeeded"
    [[ $success_count -ge 40 ]]
}

# Route bombardment test
route_bombardment_test() {
    echo "Testing random route bombardment..."
    local routes=("/" "/dashboard" "/apply/step-1" "/apply/step-2" "/apply/step-3" "/apply/step-4" "/apply/step-5" "/apply/step-6" "/pwa-test")
    local success_count=0
    local total_requests=30
    
    for ((i=1; i<=total_requests; i++)); do
        local random_route=${routes[$((RANDOM % ${#routes[@]}))]}
        if curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$CLIENT_URL$random_route" 2>/dev/null | grep -q "200"; then
            success_count=$((success_count + 1))
        fi
    done
    
    echo "Route bombardment: $success_count/$total_requests requests succeeded"
    [[ $success_count -ge 25 ]]
}

# Concurrent connection test
concurrent_test() {
    echo "Testing concurrent connections..."
    local pids=()
    local temp_dir=$(mktemp -d)
    
    # Start 10 concurrent requests
    for i in {1..10}; do
        {
            if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$CLIENT_URL/" > "$temp_dir/result_$i" 2>/dev/null; then
                echo "success" > "$temp_dir/status_$i"
            else
                echo "fail" > "$temp_dir/status_$i"
            fi
        } &
        pids+=($!)
    done
    
    # Wait for all to complete
    for pid in "${pids[@]}"; do
        wait "$pid"
    done
    
    # Count successes
    local success_count=0
    for i in {1..10}; do
        if [[ -f "$temp_dir/status_$i" ]] && grep -q "success" "$temp_dir/status_$i"; then
            success_count=$((success_count + 1))
        fi
    done
    
    rm -rf "$temp_dir"
    echo "Concurrent test: $success_count/10 requests succeeded"
    [[ $success_count -ge 8 ]]
}

# Timeout stress test
timeout_stress_test() {
    echo "Testing timeout stress scenarios..."
    local success_count=0
    
    # Test with very short timeouts
    for i in {1..20}; do
        if curl -s -o /dev/null -w "%{http_code}" --max-time 1 "$CLIENT_URL/" 2>/dev/null | grep -q "200"; then
            success_count=$((success_count + 1))
        fi
        sleep 0.1
    done
    
    echo "Timeout stress: $success_count/20 requests succeeded with 1s timeout"
    [[ $success_count -ge 15 ]]
}

# Memory pressure simulation
memory_pressure_test() {
    echo "Testing memory pressure simulation..."
    local large_requests=0
    local success_count=0
    
    # Request larger pages multiple times
    for endpoint in "/comprehensive-e2e-test" "/pwa-test" "/chatbot-ai-test"; do
        for i in {1..5}; do
            large_requests=$((large_requests + 1))
            if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$CLIENT_URL$endpoint" 2>/dev/null | grep -q "200"; then
                success_count=$((success_count + 1))
            fi
        done
    done
    
    echo "Memory pressure: $success_count/$large_requests large page requests succeeded"
    [[ $success_count -ge $((large_requests * 3 / 4)) ]]
}

# Run all chaos tests
echo "=== Starting Chaos Tests ==="
chaos_test "Rapid Fire Requests" rapid_fire_test
chaos_test "Route Bombardment" route_bombardment_test  
chaos_test "Concurrent Connections" concurrent_test
chaos_test "Timeout Stress" timeout_stress_test
chaos_test "Memory Pressure" memory_pressure_test

# Final chaos results
echo ""
echo "=== Chaos Testing Results ==="
success_rate=$((passed_chaos_tests * 100 / total_chaos_tests))

{
    echo ""
    echo "CHAOS TESTING RESULTS"
    echo "==================="
    echo "Tests passed: $passed_chaos_tests/$total_chaos_tests ($success_rate%)"
    echo "Timestamp: $(date)"
    echo ""
} >> "$log_file"

echo "Chaos tests passed: $passed_chaos_tests/$total_chaos_tests ($success_rate%)"
echo "Full report: $log_file"

if [[ $success_rate -ge 80 ]]; then
    echo "🎯 EXCELLENT: Application survived chaos testing with $success_rate% success rate"
    exit 0
elif [[ $success_rate -ge 60 ]]; then
    echo "⚡ GOOD: Application handled chaos testing with $success_rate% success rate"
    exit 0  
else
    echo "🚨 CRITICAL: Application struggled with chaos testing - only $success_rate% success rate"
    exit 1
fi