# Client Regression Report (20250813-203324)

## Static Audit

=== CLIENT STATIC AUDIT ===
--- Duplicate data-testid values (client/**) ---
continue-without-signing
final-submit
product-card
product-card--full-e2e-test
success-message
success-message--full-e2e-test
--- Suspicious repeated labels ---
--- Multiple onClick handlers per file ---
      7 client/src/components/forms/Step2ProductSelection.tsx
      7 client/src/components/ChatBot.tsx
      5 client/src/test/StageMonitorTest.tsx
      5 client/src/routes/Step5_DocumentUpload.tsx
      5 client/src/pages/WorkflowTest.tsx
      5 client/src/pages/PWADiagnosticsPage.tsx
      5 client/src/pages/PushNotificationTest.tsx
      5 client/src/pages/CookieConsentTest.tsx
      5 client/src/pages/CanadianFilteringTest.tsx
      5 client/src/pages/BackendRequestTest.tsx
      5 client/src/components/Step2RecommendationEngine.tsx
      5 client/src/components/RetryStatusBadge.tsx
      5 client/src/components/PWAOfflineQueue.tsx
      5 client/src/components/CameraDocumentUpload.tsx
      4 client/src/test/CompleteWorkflowTest.tsx
      4 client/src/pages/ValidationTestPage.tsx
      4 client/src/pages/TestingFlowValidation.tsx
      4 client/src/pages/Steps34Test.tsx
      4 client/src/pages/SimpleDashboard.tsx
      4 client/src/pages/Recommendations.tsx
=== DONE (static) ===

## Playwright - UI Crawl


Running 1 test using 1 worker

  ✘  1 tests/ui_crawl_client.spec.ts:3:1 › duplicate labels/testIDs and basic nav present (4ms)


  1) tests/ui_crawl_client.spec.ts:3:1 › duplicate labels/testIDs and basic nav present ────────────

    Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1181/chrome-linux/headless_shell
    ╔═════════════════════════════════════════════════════════════════════════╗
    ║ Looks like Playwright Test or Playwright was just installed or updated. ║
    ║ Please run the following command to download new browsers:              ║
    ║                                                                         ║
    ║     npx playwright install                                              ║
    ║                                                                         ║
    ║ <3 Playwright Team                                                      ║
    ╚═════════════════════════════════════════════════════════════════════════╝

  1 failed
    tests/ui_crawl_client.spec.ts:3:1 › duplicate labels/testIDs and basic nav present ─────────────

## Playwright - Runtime Guard


Running 1 test using 1 worker

  ✘  1 tests/runtime_guard_client.spec.ts:5:1 › no console errors; no 4xx/5xx; no slow calls (5ms)


  1) tests/runtime_guard_client.spec.ts:5:1 › no console errors; no 4xx/5xx; no slow calls ─────────

    Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1181/chrome-linux/headless_shell
    ╔═════════════════════════════════════════════════════════════════════════╗
    ║ Looks like Playwright Test or Playwright was just installed or updated. ║
    ║ Please run the following command to download new browsers:              ║
    ║                                                                         ║
    ║     npx playwright install                                              ║
    ║                                                                         ║
    ║ <3 Playwright Team                                                      ║
    ╚═════════════════════════════════════════════════════════════════════════╝

  1 failed
    tests/runtime_guard_client.spec.ts:5:1 › no console errors; no 4xx/5xx; no slow calls ──────────

---
Legend:
- Any listed duplicates must be 0
- No console errors, 0 failed network calls
- No slow API calls (>1.5s)

