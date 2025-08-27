#!/bin/bash
set -euo pipefail

CA=$(curl -s http://localhost:5000/api/v1/products 2>/dev/null | jq -r '.[].countryOffered' 2>/dev/null \
 | awk 'toupper($0)=="CA"{c++} END{print c+0}' 2>/dev/null || echo "0")

echo "CA products: $CA"
if [ "$CA" -ge 10 ]; then
  echo "✅ CA product count meets minimum requirement"
else
  echo "❌ CA product count below minimum (expected ≥10, got $CA)"
  exit 1
fi