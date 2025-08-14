import { test, expect } from "@playwright/test";
const CLIENT = process.env.CLIENT_URL || "http://127.0.0.1:5000";
const STAFF  = process.env.STAFF_URL  || "http://127.0.0.1:5000";
const MINUTES = Number(process.env.MONKEY_MINUTES || "5");

test('UI monkey: random clicks without console/network errors', async ({ page }) => {
  // Prime staff session for portal endpoints
  await page.request.post(`${STAFF}/api/portal/test-login`, { data: {} }).catch(() => {});
  
  const errors: string[] = [];
  const badNet: string[] = [];
  
  page.on('console', m => { 
    if (m.type() === 'error') errors.push(m.text()); 
  });
  
  page.on('response', async r => { 
    if (r.status() >= 400) badNet.push(`${r.status()} ${r.url()}`); 
  });

  // Start from dashboard instead of messages (which doesn't exist in this app)
  await page.goto(`${CLIENT}/dashboard`, { waitUntil: "domcontentloaded" });
  const end = Date.now() + MINUTES * 60 * 1000;

  console.log(`Starting UI monkey test for ${MINUTES} minutes on business financing PWA`);

  while (Date.now() < end) {
    try {
      // Random click targets: buttons, links, navigation elements
      const clickableElements = page.locator('button, a, [role="button"], [role="tab"], [role="menuitem"], [data-testid*="button"], [data-testid*="btn"]');
      const count = await clickableElements.count();
      
      if (count > 0) {
        const idx = Math.floor(Math.random() * count);
        await clickableElements.nth(idx).click({ timeout: 2000 }).catch(() => {});
      }
      
      // Occasionally navigate to different application routes
      if (Math.random() < 0.1) {
        const routes = ['/dashboard', '/apply/step-1', '/pwa-test', '/comprehensive-e2e-test', '/chatbot-ai-test'];
        const randomRoute = routes[Math.floor(Math.random() * routes.length)];
        await page.goto(`${CLIENT}${randomRoute}`, { waitUntil: "domcontentloaded" }).catch(() => {});
      }
      
      // Occasionally interact with forms or input fields
      if (Math.random() < 0.15) {
        const inputs = page.locator('input[type="text"], input[type="email"], textarea, select');
        const inputCount = await inputs.count();
        if (inputCount > 0) {
          const inputIdx = Math.floor(Math.random() * inputCount);
          await inputs.nth(inputIdx).fill(`monkey_test_${Date.now()}`).catch(() => {});
        }
      }
      
      // Random wait between actions
      await page.waitForTimeout(Math.floor(Math.random() * 1000) + 300);
      
    } catch (error) {
      // Log but continue testing
      console.log(`Monkey test action failed: ${error}`);
    }
  }

  console.log(`UI monkey test completed. Console errors: ${errors.length}, Network errors: ${badNet.length}`);
  
  // Report findings
  if (errors.length > 0) {
    console.log('Console errors found:', errors);
  }
  if (badNet.length > 0) {
    console.log('Network errors found:', badNet);
  }

  expect(errors, 'console errors during monkey testing').toHaveLength(0);
  expect(badNet, 'network 4xx/5xx errors during monkey testing').toHaveLength(0);
});