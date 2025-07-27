#!/bin/bash

# CI Build Script with Document Type Mapping Validation
# Enforces mapping consistency before allowing build to proceed

echo "🚀 BUILD WITH VALIDATION"
echo "============================================================"

# Step 1: Validate document type mappings
echo "🔍 Running document type mapping validation..."
tsx scripts/validateMappings.ts

# Check if validation passed
if [ $? -ne 0 ]; then
    echo "❌ VALIDATION FAILED - Build aborted"
    echo "Fix document type mapping issues before building"
    exit 1
fi

echo "✅ All validations passed - proceeding with build"
echo "============================================================"

# Step 2: Run the normal build process
echo "🏗️  Building application..."
vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "🎉 BUILD COMPLETED SUCCESSFULLY"
else
    echo "❌ BUILD FAILED"
    exit 1
fi