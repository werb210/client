#!/bin/bash

# Production Console Cleanup Script
# Systematically replaces console.log statements with production-safe logger

echo "🔧 Starting production console cleanup..."

# Files to update with logger imports and console replacements
files=(
  "client/src/components/MultiStepForm/SignatureStep.tsx"
  "client/src/components/Step3BusinessDetails.tsx"
  "client/src/components/CookieNotice.tsx"
  "client/src/components/GlobalErrorBoundary.tsx"
  "client/src/components/RetryFailedUploads.tsx"
  "client/src/components/CookiePreferencesModal.tsx"
  "client/src/components/DocumentUpload.tsx"
  "client/src/components/DynamicDocumentRequirements.tsx"
  "client/src/routes/Step1_FinancialProfile_Complete.tsx"
  "client/src/routes/Step2_Recommendations.tsx"
  "client/src/routes/Step3_BusinessDetails_Complete.tsx"
  "client/src/routes/Step4_ApplicantInfo_Complete.tsx"
  "client/src/routes/Step5_DocumentUpload.tsx"
  "client/src/routes/Step7_Finalization.tsx"
  "client/src/routes/Step7_Submit.tsx"
  "client/src/routes/LandingPage.tsx"
)

for file in "${files[@]}"; do
  if [[ -f "$file" ]]; then
    echo "🔄 Processing $file..."
    
    # Add logger import if not present
    if ! grep -q "import.*logger.*from.*@/lib/utils" "$file"; then
      # Find the last import line and add logger import
      sed -i '/^import.*from/a import { logger } from '"'"'@/lib/utils'"'"';' "$file"
    fi
    
    # Replace console statements
    sed -i 's/console\.log(/logger.log(/g' "$file"
    sed -i 's/console\.warn(/logger.warn(/g' "$file"
    sed -i 's/console\.error(/logger.error(/g' "$file"
    
    echo "✅ Updated $file"
  fi
done

echo "🎉 Production console cleanup complete!"
echo "📊 Checking remaining console statements..."

# Count remaining console statements
remaining=$(grep -r "console\." client/src --include="*.tsx" --include="*.ts" | wc -l)
echo "🔍 Remaining console statements: $remaining"

if [ "$remaining" -gt 0 ]; then
  echo "⚠️  Some console statements remain - manual review required"
  grep -r "console\." client/src --include="*.tsx" --include="*.ts" | head -10
fi