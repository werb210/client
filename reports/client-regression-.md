# Client Regression — Post TestID Dedupe

Sections included in the console output above:
- TestID Usage (BEFORE)
- Refactor results (files updated)
- TestID Usage (AFTER)
- Static Audit (duplicates, labels, handlers)
- Playwright UI Crawl
- Playwright Runtime Guard

Pass conditions:
- No duplicate TestIDs remain for: continue-without-signing, final-submit, product-card, success-message, upload-area (in tests)
- No console errors or broken network calls
- No slow API calls (>1.5s)
