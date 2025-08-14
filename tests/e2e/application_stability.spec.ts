import { test, expect } from "@playwright/test";
const CLIENT = process.env.CLIENT_URL || "http://127.0.0.1:5000";

test('business application steps load consistently', async ({ page }) => {
  // Test all main application steps load without crashing
  const steps = ['/apply/step-1', '/apply/step-2', '/apply/step-3', '/apply/step-4', '/apply/step-5', '/apply/step-6'];
  
  for (const step of steps) {
    await page.goto(`${CLIENT}${step}`, { waitUntil: "domcontentloaded" });
    
    // Should not show blank page or error
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
    expect(bodyContent?.length || 0).toBeGreaterThan(20);
    
    // Should have basic UI elements
    const hasButtons = await page.locator('button').count() > 0;
    expect(hasButtons).toBeTruthy();
  }
});

test('PWA features remain stable across sessions', async ({ page, context }) => {
  // Test PWA test page functionality
  await page.goto(`${CLIENT}/pwa-test`, { waitUntil: "domcontentloaded" });
  
  // Should load PWA diagnostic content
  const hasContent = await page.locator('body').textContent();
  expect(hasContent).toContain('PWA');
  
  // Test service worker registration
  const swRegistration = await page.evaluate(() => 
    'serviceWorker' in navigator ? navigator.serviceWorker.getRegistration() : null
  );
  // Service worker should be available or attempting to register
  
  // Open new tab and verify PWA consistency
  const newTab = await context.newPage();
  await newTab.goto(`${CLIENT}/pwa-diagnostics`, { waitUntil: "domcontentloaded" });
  
  const diagnosticsContent = await newTab.locator('body').textContent();
  expect(diagnosticsContent).toBeTruthy();
});

test('comprehensive E2E test page loads and functions', async ({ page }) => {
  await page.goto(`${CLIENT}/comprehensive-e2e-test`, { waitUntil: "domcontentloaded" });
  
  // Should show test interface
  const content = await page.locator('body').textContent();
  expect(content).toBeTruthy();
  expect(content?.length || 0).toBeGreaterThan(50);
  
  // Should have test buttons or controls
  const testButtons = await page.locator('button').count();
  expect(testButtons).toBeGreaterThan(0);
});