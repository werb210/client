#!/usr/bin/env bash
set -euo pipefail
echo "Client v1:"
curl -s http://localhost:5000/api/v1/products | jq 'length as $n | {total:$n, by_country:(group_by(.countryOffered)|map({k:.[0].countryOffered, n:length}))}'
echo "Client legacy:"
curl -s http://localhost:5000/api/lender-products | jq '{total, by_country:(.products|group_by(.country)|map({k:.[0].country, n:length}))}'