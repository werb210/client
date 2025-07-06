#!/bin/bash

# Cypress Local Test Runner Script
# Usage: ./scripts/cypress-local.sh [open|run|report]

set -e

echo "🚀 Boreal Financial - Cypress Test Runner"
echo "=========================================="

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables
export VITE_CLIENT_APP_SHARED_TOKEN="83f8f007b62dfe94e4e4def10b2f8958c028de8abaa047e1376d3b9c1f3c6256"

case "${1:-run}" in
    "open")
        echo "🖥️  Opening Cypress GUI..."
        npx cypress open
        ;;
    "run")
        echo "🔄 Running Cypress tests headlessly..."
        npx cypress run --spec "cypress/e2e/client/application_flow.cy.ts" --browser chrome
        ;;
    "report")
        echo "📊 Generating test report..."
        npx cypress run --spec "cypress/e2e/client/application_flow.cy.ts" --reporter mochawesome --reporter-options "reportDir=cypress/reports,overwrite=false,html=true,json=false"
        echo "✅ Report generated at: cypress/reports/mochawesome.html"
        ;;
    "ci")
        echo "🤖 Running CI-style tests..."
        npx cypress run --spec "cypress/e2e/client/application_flow.cy.ts" --browser chrome --record false --video false
        ;;
    *)
        echo "Usage: $0 [open|run|report|ci]"
        echo ""
        echo "Commands:"
        echo "  open   - Open Cypress GUI for interactive testing"
        echo "  run    - Run tests headlessly (default)"
        echo "  report - Run tests and generate HTML report"
        echo "  ci     - Run tests in CI mode (no video)"
        exit 1
        ;;
esac

echo "✅ Cypress execution complete!"