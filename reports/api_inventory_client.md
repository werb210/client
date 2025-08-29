# Client→Staff API Inventory

- Base: https://staff.boreal.financial/api
- When: 2025-08-29T23:55:35.465Z

| name | method | path | status | ok | ct | count/sample |
|---|---|---|---:|:--:|---|---|
| products_v1 | GET | `/v1/products` | 200 | ✅ | application/json; charset=utf-8 | 0 |
| lenders | GET | `/lenders` | 200 | ✅ | application/json; charset=utf-8 | 0 |
| required_docs | GET | `/required-docs` | 404 | ❌ | application/json; charset=utf-8 | `sample` |
| validate_new | POST | `/applications/validate-intake` | 404 | ❌ | text/html; charset=utf-8 | `sample` |
| validate_old | POST | `/applications/validate-intake` | 404 | ❌ | text/html; charset=utf-8 | `sample` |
| uploads_pre | OPTIONS | `/uploads` | 401 | ❌ |  |  |
| lenders_pre | OPTIONS | `/lenders` | 200 | ✅ |  |  |
