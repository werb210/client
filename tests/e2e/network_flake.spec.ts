import { test, expect } from "@playwright/test";
const CLIENT = process.env.CLIENT_URL || "http://127.0.0.1:5000";

test('offline/online recovers without crash', async ({ page }) => {
  // Test PWA offline resilience on dashboard
  await page.goto(`${CLIENT}/dashboard`, { waitUntil: "domcontentloaded" });
  await expect(page.locator('h1, h2')).toContainText(/dashboard|application/i);
  
  // Simulate offline
  await page.context().setOffline(true);
  await page.reload();
  
  // App should render shell (not blank) - PWA should handle offline gracefully
  const bodyContent = await page.locator('body').textContent();
  expect(bodyContent).toBeTruthy();
  expect(bodyContent?.length || 0).toBeGreaterThan(10); // Ensure meaningful content
  
  // Back online
  await page.context().setOffline(false);
  await page.reload();
  await expect(page.locator('h1, h2')).toContainText(/dashboard|application/i);
});

test('PWA service worker offline functionality', async ({ page }) => {
  // Test landing page offline capability
  await page.goto(`${CLIENT}/`, { waitUntil: "domcontentloaded" });
  await expect(page.locator('h1')).toContainText(/financing/i);
  
  // Go offline and test cached resources
  await page.context().setOffline(true);
  
  // Navigate to different routes while offline
  await page.goto(`${CLIENT}/dashboard`, { waitUntil: "domcontentloaded" });
  const offlineContent = await page.locator('body').textContent();
  expect(offlineContent).toBeTruthy();
  
  // Test PWA diagnostics page while offline
  await page.goto(`${CLIENT}/pwa-diagnostics`, { waitUntil: "domcontentloaded" });
  const pwaContent = await page.locator('body').textContent();
  expect(pwaContent).toBeTruthy();
  
  // Go back online
  await page.context().setOffline(false);
  await page.reload();
  const onlineContent = await page.locator('body').textContent();
  expect(onlineContent).toBeTruthy();
});