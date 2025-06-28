#!/bin/bash
echo "Testing staff backend API connectivity..."

# Test 1: Check if API endpoint exists
echo "1. Testing API endpoint availability:"
curl -X GET "https://staffportal.replit.app/api/health" \
  -H "Accept: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s

echo -e "\n2. Testing registration endpoint:"
curl -X POST "https://staffportal.replit.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","phone":"+15878881837"}' \
  -w "\nStatus: %{http_code}\n" \
  -s

echo -e "\n3. Testing root endpoint (should return HTML):"
curl -X GET "https://staffportal.replit.app/" \
  -H "Accept: text/html" \
  -w "\nStatus: %{http_code}\n" \
  -s | head -5