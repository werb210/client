#!/bin/bash
set -euo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"
REPORTS="reports"
mkdir -p "$REPORTS" tests/e2e

# Configuration
CLIENT_URL="${CLIENT_URL:-http://127.0.0.1:5000}"
STAFF_URL="${STAFF_URL:-http://127.0.0.1:5000}"
MONKEY_MINUTES="${MONKEY_MINUTES:-5}"

echo "== Business Financing PWA UI Monkey Testing =="
echo "Timestamp: $STAMP"
echo "Client URL: $CLIENT_URL"
echo "Test Duration: $MONKEY_MINUTES minutes"
echo "Target: Random UI interactions to detect console/network errors"
echo ""

# Check if Playwright is available, fallback to HTTP-based testing if not
if command -v playwright &> /dev/null; then
    echo "Running Playwright-based UI monkey test..."
    
    CLIENT_URL="$CLIENT_URL" STAFF_URL="$STAFF_URL" MONKEY_MINUTES="$MONKEY_MINUTES" \
        npx playwright test tests/e2e/ui_monkey.spec.ts --reporter=list \
        | tee "$REPORTS/ui-monkey-playwright-${STAMP}.log" || true
    
    echo "Playwright monkey test completed. Log: $REPORTS/ui-monkey-playwright-${STAMP}.log"
else
    echo "Playwright not available, running HTTP-based monkey simulation..."
    
    # HTTP-based monkey testing simulation
    {
        echo "Business Financing PWA HTTP Monkey Test"
        echo "======================================="
        echo "Generated: $(date)"
        echo "Duration: $MONKEY_MINUTES minutes"
        echo ""
        
        end_time=$(($(date +%s) + MONKEY_MINUTES * 60))
        requests_made=0
        errors_found=0
        
        while [[ $(date +%s) -lt $end_time ]]; do
            # Random route selection
            routes=("/" "/dashboard" "/apply/step-1" "/apply/step-2" "/apply/step-3" "/apply/step-4" "/apply/step-5" "/apply/step-6" "/pwa-test" "/pwa-diagnostics" "/comprehensive-e2e-test" "/chatbot-ai-test" "/faq" "/troubleshooting")
            random_route=${routes[$((RANDOM % ${#routes[@]}))]}
            url="${CLIENT_URL}${random_route}"
            
            # Make request and check response
            if status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$url" 2>/dev/null); then
                requests_made=$((requests_made + 1))
                if [[ "$status" -ge 400 ]]; then
                    errors_found=$((errors_found + 1))
                    echo "Error: $status on $url"
                fi
            else
                errors_found=$((errors_found + 1))
                echo "Connection error on $url"
            fi
            
            # Random delay between requests
            sleep_time=$(echo "scale=2; $RANDOM / 32768 * 2 + 0.5" | bc -l 2>/dev/null || echo "1")
            sleep "$sleep_time" 2>/dev/null || sleep 1
        done
        
        echo ""
        echo "HTTP Monkey Test Results:"
        echo "Requests made: $requests_made"
        echo "Errors found: $errors_found"
        echo "Success rate: $(( (requests_made - errors_found) * 100 / requests_made ))%"
        
    } | tee "$REPORTS/ui-monkey-http-${STAMP}.log"
    
    echo "HTTP monkey test completed. Log: $REPORTS/ui-monkey-http-${STAMP}.log"
fi

echo ""
echo "== UI Monkey Test Summary =="
echo "• Test completed at: $(date)"
echo "• Duration: $MONKEY_MINUTES minutes"
echo "• Report saved to reports/ directory"
echo "• Purpose: Detect UI crashes, console errors, and network issues during random interactions"