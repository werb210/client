#!/bin/bash

# Pre-push Validation Script
# Runs document type mapping validation before git push

echo "🔍 PRE-PUSH VALIDATION"
echo "============================================================"

# Validate document type mappings
echo "📋 Checking document type mappings..."
tsx scripts/validateMappings.ts

# Check if validation passed
if [ $? -ne 0 ]; then
    echo "❌ PRE-PUSH VALIDATION FAILED"
    echo "Fix document type mapping issues before pushing"
    exit 1
fi

echo "✅ All pre-push validations passed"
echo "🚀 Ready to push to repository"
echo "============================================================"