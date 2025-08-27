#!/usr/bin/env bash
set -euo pipefail
echo "Total (v1): $(curl -s http://localhost:5000/api/v1/products | jq 'length')"
echo "By country: "; curl -s http://localhost:5000/api/v1/products | jq 'group_by(.countryOffered)|map({k:.[0].countryOffered, n:length})'