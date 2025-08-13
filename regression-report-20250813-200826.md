# Regression Report (20250813-200826)

## Client Static Audit

=== CLIENT STATIC AUDIT ===
--- Duplicate data-testid values ---
continue-without-signing
final-submit
product-card
success-message
upload-area
--- Suspicious repeated labels ---
--- Multiple onClick bindings per file (heuristic) ---
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

## Playwright - Client UI Crawl


Running 1 test using 1 worker

  ✘  1 tests/ui_crawl_client.spec.ts:5:1 › core navigation works; duplicate labels flagged (5ms)


  1) tests/ui_crawl_client.spec.ts:5:1 › core navigation works; duplicate labels flagged ───────────

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
    tests/ui_crawl_client.spec.ts:5:1 › core navigation works; duplicate labels flagged ────────────

## Playwright - Client Runtime Guard


Running 1 test using 1 worker

  ✘  1 tests/runtime_guard_client.spec.ts:5:1 › client no console errors and no broken network calls (5ms)


  1) tests/runtime_guard_client.spec.ts:5:1 › client no console errors and no broken network calls ─

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
    tests/runtime_guard_client.spec.ts:5:1 › client no console errors and no broken network calls ──

## CI Guards

=== CI GUARDS ===
--- CORS duplications ---
server/index.ts:55:    res.header('Access-Control-Allow-Origin', origin || '*');
server/index.ts:58:  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
server/index.ts:59:  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
server/index.ts:60:  res.header('Access-Control-Allow-Credentials', 'true');
--- Express route duplications ---
  app.get('/api/public/applications/
  app.patch('/api/public/applications/
  app.post('/api/public/upload/
--- Missing environment checks ---
server/check-advance-funds.cjs:12:    'Authorization': 'Bearer ' + process.env.VITE_CLIENT_APP_SHARED_TOKEN
server/index.ts:40:console.log('REPLIT_ENVIRONMENT:', process.env.REPLIT_ENVIRONMENT);
server/index.ts:42:console.log('🧪 Environment VITE_STAFF_API_URL:', process.env.VITE_STAFF_API_URL);
server/index.ts:1447:    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
server/chatEscalationRoutes.ts:30:      const staffBackendUrl = process.env.VITE_API_BASE_URL || 'https://staff.boreal.financial/api';
server/chatEscalationRoutes.ts:35:          'Authorization': `Bearer ${process.env.VITE_CLIENT_APP_SHARED_TOKEN}`
server/chatEscalationRoutes.ts:119:      const staffBackendUrl = process.env.VITE_API_BASE_URL || 'https://staff.boreal.financial/api';
server/chatEscalationRoutes.ts:124:          'Authorization': `Bearer ${process.env.VITE_CLIENT_APP_SHARED_TOKEN}`
server/debug-categories.cjs:10:    'Authorization': 'Bearer ' + process.env.VITE_CLIENT_APP_SHARED_TOKEN
server/test-accord-access.cjs:10:    'Authorization': 'Bearer ' + process.env.VITE_CLIENT_APP_SHARED_TOKEN
=== DONE (ci_guards) ===

---
**Status legend:**
- Static audit lists duplicates (must be 0)
- Playwright tests must pass (0 console errors, 0 network errors, buttons clickable)
- CI guards must pass (no CORS or route duplication)

