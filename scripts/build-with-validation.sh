#!/bin/bash

# 🔒 BUILD WITH DOCUMENT ENUM VALIDATION
# Pre-build validation script for CI/CD
# Ensures document enum consistency before deployment

set -e

echo "🔒 DOCUMENT ENUM VALIDATION - PRE-BUILD CHECK"
echo "=============================================="

# Step 1: Validate document enums
echo "📋 Validating document enum consistency..."
tsx scripts/validateDocumentEnums.ts

if [ $? -ne 0 ]; then
    echo "❌ Document enum validation FAILED"
    echo "💡 Fix enum inconsistencies before building"
    exit 1
fi

echo "✅ Document enum validation PASSED"

# Step 2: TypeScript check
echo "🔍 Running TypeScript checks..."
tsc --noEmit

if [ $? -ne 0 ]; then
    echo "❌ TypeScript validation FAILED"
    exit 1
fi

echo "✅ TypeScript validation PASSED"

# Step 3: Proceed with normal build
echo "🚀 Starting application build..."
vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

if [ $? -eq 0 ]; then
    echo "🎉 BUILD SUCCESSFUL WITH VALIDATION"
    echo "✅ All document enums validated"
    echo "✅ TypeScript checks passed"
    echo "✅ Application built successfully"
else
    echo "❌ BUILD FAILED"
    exit 1
fi