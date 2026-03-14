# BF-Client Final API Check Report

Date: 2026-03-14

## Commands run

1. Attempted full verification script from repository root.
2. Re-ran the same workflow from `client-app/` (where `package.json` exists).
3. Extracted client API routes into `artifacts/client-routes.txt`.

## Results

### Dependency install
- `npm install` from repository root failed because `/workspace/BF-client/package.json` does not exist.
- `npm install` from `client-app/` started but failed with `403 Forbidden - GET https://registry.npmjs.org/yaml`.

### API route extraction
- Extracted client routes to `artifacts/client-routes.txt`.

### Server route contract fetch
- `curl` to `https://raw.githubusercontent.com/werb210/staff/main/artifacts/server-routes.txt` failed in this environment with HTTP 403 (`CONNECT tunnel failed`).
- Because the authoritative server route file could not be downloaded, a full client-vs-server route diff could not be completed.

### Build verification
- `npm run build` could not be executed because dependency installation failed due registry access restrictions.

## Conclusion
- Partial verification completed (client route extraction).
- Full API parity and build verification are blocked by environment/network restrictions.
