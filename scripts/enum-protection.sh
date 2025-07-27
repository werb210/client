#!/bin/bash

# Document Enum Protection Script
# Prevents unauthorized modifications to document type enums
# Created: January 27, 2025

set -e

ENUM_FILES=(
    "client/src/lib/documentCategories.ts"
    "shared/documentTypes.ts"
    "client/src/lib/docNormalization.ts"
)

echo "🔒 DOCUMENT ENUM PROTECTION CHECK"
echo "================================="

# Check if any enum files are being modified
MODIFIED_ENUM_FILES=()
for file in "${ENUM_FILES[@]}"; do
    if git diff --cached --name-only | grep -q "^$file$"; then
        MODIFIED_ENUM_FILES+=("$file")
    fi
done

if [ ${#MODIFIED_ENUM_FILES[@]} -eq 0 ]; then
    echo "✅ No enum files modified - proceeding with commit"
    exit 0
fi

echo "⚠️  ENUM MODIFICATION DETECTED"
echo "Modified files:"
for file in "${MODIFIED_ENUM_FILES[@]}"; do
    echo "  - $file"
done

# Check for authorization in commit message
COMMIT_MSG=$(cat .git/COMMIT_EDITMSG 2>/dev/null || echo "")

if echo "$COMMIT_MSG" | grep -q "\[ENUM-AUTHORIZED\]"; then
    echo "✅ Enum modification authorized via commit message"
    
    # Run validation tests
    echo ""
    echo "🧪 Running enum validation tests..."
    
    if npx tsx scripts/validateEnumSnapshot.ts; then
        echo "✅ Enum snapshot validation passed"
    else
        echo "❌ Enum snapshot validation failed"
        exit 1
    fi
    
    if npx jest scripts/checkEnumMatch.test.ts --silent; then
        echo "✅ Enum contract tests passed"
    else
        echo "❌ Enum contract tests failed"
        exit 1
    fi
    
    echo ""
    echo "🎉 All enum validation checks passed"
    echo "✅ Commit authorized - proceeding"
    
else
    echo ""
    echo "❌ ENUM MODIFICATION BLOCKED"
    echo ""
    echo "Document type enums are protected from unauthorized changes."
    echo ""
    echo "To authorize this change:"
    echo "1. Add [ENUM-AUTHORIZED] to your commit message"
    echo "2. Ensure changes follow the Staff App canonical truth source"
    echo "3. Run validation: npx tsx scripts/validateEnumSnapshot.ts"
    echo ""
    echo "Example commit message:"
    echo "  feat: update document types [ENUM-AUTHORIZED]"
    echo ""
    echo "Protected files:"
    for file in "${ENUM_FILES[@]}"; do
        echo "  - $file"
    done
    echo ""
    exit 1
fi