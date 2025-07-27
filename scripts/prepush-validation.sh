#!/bin/bash

# 🔒 PRE-PUSH VALIDATION SCRIPT
# Git pre-push hook to prevent invalid document enum commits
# Usage: Add to .git/hooks/pre-push

set -e

echo "🔒 PRE-PUSH DOCUMENT ENUM VALIDATION"
echo "===================================="

# Validate document enums before push
echo "📋 Checking document enum consistency..."
tsx scripts/validateDocumentEnums.ts

if [ $? -ne 0 ]; then
    echo "❌ PUSH BLOCKED: Document enum validation failed"
    echo ""
    echo "🔧 ACTION REQUIRED:"
    echo "1. Fix document enum inconsistencies"
    echo "2. Run: tsx scripts/validateDocumentEnums.ts" 
    echo "3. Commit fixes and try push again"
    echo ""
    exit 1
fi

echo "✅ Document enum validation passed"
echo "🚀 Push allowed - all enums consistent"

exit 0