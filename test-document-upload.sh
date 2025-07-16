#!/bin/bash

echo "🔄 BEGIN 6-DOCUMENT UPLOAD TEST TO STAFF BACKEND"
echo "================================================"

files=(
  "attached_assets/November 2024_1752681977989.pdf"
  "attached_assets/December 2024_1752681977989.pdf"
  "attached_assets/January 2025_1752681977988.pdf"
  "attached_assets/February 2025_1752681977988.pdf"
  "attached_assets/March 2025_1752681977988.pdf"
  "attached_assets/April 2025_1752681977985.pdf"
)

applicationId="test-12345678-1234-5678-9abc-123456789012"
success_count=0
failed_count=0

for file in "${files[@]}"; do
  filename=$(basename "$file")
  echo
  echo "📄 Uploading: $filename"

  if [ ! -f "$file" ]; then
    echo "❌ File not found: $file"
    ((failed_count++))
    continue
  fi

  response=$(curl -s -X POST "https://staff.boreal.financial/api/public/applications/$applicationId/documents" \
    -F "document=@$file" \
    -F "documentType=bank_statements" \
    -w "HTTPSTATUS:%{http_code}" \
    2>/dev/null)

  status_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
  body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')

  echo "✅ Status: $status_code ($(if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then echo 'SUCCESS'; else echo 'FAILED'; fi))"
  echo "📬 Response: $body"

  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    ((success_count++))
  else
    ((failed_count++))
  fi
done

echo
echo "✅ FINAL REPORT:"
echo "📦 Total Successful Uploads: $success_count"
echo "❌ Total Failed Uploads: $failed_count"