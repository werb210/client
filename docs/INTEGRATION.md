# Client ↔ Staff Integration (Production)

## Required environment
- `VITE_STAFF_API_URL=https://staff.boreal.financial/api`
- `VITE_CLIENT_APP_SHARED_TOKEN=<same as STAFF CLIENT_SHARED_BEARER>`

## Endpoints used by client
- `/v1/products` (GET) → expect ≥44 items
- `/lenders` (GET) → expect ≥30 items
- `/applications/validate-intake` (POST, preferred)
  - Success → **200** `{ ok:true, validated:true, details }`
  - Missing/invalid → **400** `{ ok:false, errors:[…], details? }`

**All requests** send `Authorization: Bearer <token>`; include `credentials: "include"` if sessions are used.

## Pre-deploy smoke
```bash
VITE_STAFF_API_URL=https://staff.boreal.financial/api \
VITE_CLIENT_APP_SHARED_TOKEN=*** \
npx playwright test -g "Client↔Staff API smoke"
# or
VITE_STAFF_API_URL=https://staff.boreal.financial/api \
VITE_CLIENT_APP_SHARED_TOKEN=*** \
./scripts/smoke.client.sh
```