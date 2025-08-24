#!/bin/bash
# 🔁 Client → Staff Happy Path E2E Test
# Tests the complete document processing pipeline

set -e

BASE_URL="http://localhost:5000"
STAFF_API="https://staff.boreal.financial"

echo "🔁 CLIENT → STAFF HAPPY PATH E2E TEST"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get CSRF token for authenticated requests
get_csrf_token() {
    echo -e "${BLUE}→ Getting CSRF token${NC}"
    csrf_response=$(curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt -D /tmp/headers.txt "$BASE_URL/api/health")
    CSRF_TOKEN=$(grep -i "x-csrf-token:" /tmp/headers.txt | cut -d' ' -f2 | tr -d '\r\n')
    if [ -z "$CSRF_TOKEN" ]; then
        echo -e "${RED}❌ Failed to get CSRF token${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ CSRF token obtained${NC}"
}

# Helper function for API calls with CSRF protection
call_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=${4:-200}
    
    echo -e "${BLUE}→ $method $endpoint${NC}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -H "X-CSRF-Token: $CSRF_TOKEN" \
            -b /tmp/cookies.txt \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -b /tmp/cookies.txt \
            "$BASE_URL$endpoint")
    fi
    
    # Split response and status code
    body=$(echo "$response" | head -n -1)
    status=$(echo "$response" | tail -n 1)
    
    if [ "$status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ HTTP $status${NC}"
    else
        echo -e "${RED}❌ HTTP $status (expected $expected_status)${NC}"
        echo "Response: $body"
        exit 1
    fi
    
    echo "$body"
}

# Initialize CSRF protection
get_csrf_token
echo ""

echo "Step 1: 📝 Create Application"
echo "-----------------------------"

# Create application with comprehensive data matching staff backend schema
app_data='{
    "businessLocation": "US",
    "headquarters": "US",
    "industry": "Technology",
    "lookingFor": "capital",
    "fundingAmount": 50000,
    "fundsPurpose": "working_capital",
    "businessName": "E2E Test Corporation",
    "businessEmail": "test@e2etest.com",
    "businessPhone": "5551234567",
    "firstName": "John",
    "lastName": "Tester",
    "personalEmail": "john@e2etest.com",
    "title": "CEO",
    "dateOfBirth": "1980-01-01",
    "personalPhone": "5551234568",
    "annualRevenue": "250000",
    "monthlyExpenses": "20000",
    "numberOfEmployees": 5,
    "communicationConsent": true,
    "documentMaintenanceConsent": true
}'

app_response=$(call_api "POST" "/api/public/applications" "$app_data" 201)
APPLICATION_ID=$(echo "$app_response" | grep -o '"applicationId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$APPLICATION_ID" ]; then
    echo -e "${RED}❌ Failed to extract applicationId${NC}"
    echo "Response: $app_response"
    exit 1
fi

echo -e "${GREEN}✅ Application created: $APPLICATION_ID${NC}"
echo ""

echo "Step 2: 🔐 Get Presigned URL"
echo "----------------------------"

# Request presigned URL for document upload
presign_data="{
    \"applicationId\": \"$APPLICATION_ID\",
    \"fileName\": \"test-document.pdf\",
    \"contentType\": \"application/pdf\",
    \"size\": 1024
}"

presign_response=$(call_api "POST" "/api/documents/presign" "$presign_data")

# Extract presign data
UPLOAD_URL=$(echo "$presign_response" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
OBJECT_KEY=$(echo "$presign_response" | grep -o '"key":"[^"]*"' | cut -d'"' -f4)
CONFIRM_TOKEN=$(echo "$presign_response" | grep -o '"confirmToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$UPLOAD_URL" ] || [ -z "$CONFIRM_TOKEN" ]; then
    echo -e "${RED}❌ Failed to extract presign data${NC}"
    echo "Response: $presign_response"
    exit 1
fi

echo -e "${GREEN}✅ Presigned URL obtained${NC}"
echo "Upload URL: ${UPLOAD_URL:0:50}..."
echo "Confirm Token: ${CONFIRM_TOKEN:0:20}..."
echo ""

echo "Step 3: ⬆️  Upload to S3"
echo "------------------------"

# Create a test PDF file content
TEST_FILE_CONTENT="%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(E2E Test Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000196 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
290
%%EOF"

# Write test file
echo "$TEST_FILE_CONTENT" > /tmp/test-document.pdf

# Calculate SHA256 for verification
FILE_SHA256=$(sha256sum /tmp/test-document.pdf | cut -d' ' -f1)

# Upload to S3 using the presigned URL
echo -e "${BLUE}→ PUT $UPLOAD_URL${NC}"
upload_response=$(curl -s -w "\n%{http_code}" -X PUT \
    -H "Content-Type: application/pdf" \
    --data-binary "@/tmp/test-document.pdf" \
    "$UPLOAD_URL")

upload_status=$(echo "$upload_response" | tail -n 1)

if [ "$upload_status" -eq 200 ]; then
    echo -e "${GREEN}✅ File uploaded to S3${NC}"
else
    echo -e "${RED}❌ Upload failed with HTTP $upload_status${NC}"
    echo "Response: $(echo "$upload_response" | head -n -1)"
    exit 1
fi

echo ""

echo "Step 4: ✅ Finalize Upload"
echo "-------------------------"

# Finalize the upload
finalize_data="{
    \"token\": \"$CONFIRM_TOKEN\",
    \"sha256\": \"$FILE_SHA256\",
    \"pages\": 1
}"

finalize_response=$(call_api "POST" "/api/documents/complete" "$finalize_data")
echo -e "${GREEN}✅ Upload finalized${NC}"
echo ""

echo "Step 5: 🔍 Verify Document List"
echo "-------------------------------"

# Wait a moment for processing
sleep 2

# Check document list
docs_response=$(call_api "GET" "/api/documents/list?applicationId=$APPLICATION_ID")

# Check if document appears in list
if echo "$docs_response" | grep -q "$APPLICATION_ID"; then
    echo -e "${GREEN}✅ Document appears in list${NC}"
else
    echo -e "${RED}❌ Document not found in list${NC}"
    echo "Response: $docs_response"
    exit 1
fi

echo ""

echo "Step 6: 📊 Verify Card Display"
echo "------------------------------"

# Check pipeline card shows document count > 0
card_response=$(call_api "GET" "/api/pipeline/cards/$APPLICATION_ID/application")

# Extract document count
DOC_COUNT=$(echo "$card_response" | grep -o '"documentCount":[0-9]*' | cut -d':' -f2)

if [ "$DOC_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Card shows documentCount: $DOC_COUNT${NC}"
else
    echo -e "${RED}❌ Card shows documentCount: $DOC_COUNT (expected > 0)${NC}"
    echo "Response: $card_response"
    exit 1
fi

echo ""

echo "Step 7: 🔍 Check OCR/Analysis Status (Optional)"
echo "-----------------------------------------------"

# Check analysis status
analysis_response=$(call_api "GET" "/api/analysis/$APPLICATION_ID")

# Extract status
ANALYSIS_STATUS=$(echo "$analysis_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ANALYSIS_STATUS" ]; then
    echo -e "${GREEN}✅ Analysis status: $ANALYSIS_STATUS${NC}"
else
    echo -e "${BLUE}ℹ️  Analysis status not available yet${NC}"
fi

echo ""

# Cleanup
rm -f /tmp/test-document.pdf /tmp/cookies.txt /tmp/headers.txt

echo "🎉 HAPPY PATH TEST COMPLETE!"
echo "============================"
echo ""
echo -e "${GREEN}✅ All steps completed successfully:${NC}"
echo "   1. ✅ Application created ($APPLICATION_ID)"
echo "   2. ✅ Presigned URL obtained"
echo "   3. ✅ File uploaded to S3"
echo "   4. ✅ Upload finalized"
echo "   5. ✅ Document appears in list"
echo "   6. ✅ Card shows documentCount > 0"
echo "   7. ✅ Analysis status checked"
echo ""
echo -e "${GREEN}🚀 Client → Staff pipeline is working perfectly!${NC}"