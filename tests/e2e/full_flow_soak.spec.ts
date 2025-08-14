import { test, expect } from "@playwright/test";
const CLIENT = process.env.CLIENT_URL || "http://127.0.0.1:5000";
const STAFF  = process.env.STAFF_URL  || "http://127.0.0.1:5000";

test('client application flow with hard reloads', async ({ page, context }) => {
  // Test landing page stability across reloads
  await page.goto(`${CLIENT}/`, { waitUntil: "domcontentloaded" });
  await expect(page.locator('h1')).toContainText(/financing/i);

  for (let i=0;i<15;i++){
    await page.reload();
    // Landing page should always load
    await expect(page.locator('h1')).toContainText(/financing/i);
  }

  // Test dashboard route stability
  await page.goto(`${CLIENT}/dashboard`, { waitUntil: "domcontentloaded" });
  await expect(page.locator('h1, h2')).toContainText(/dashboard|application/i);

  for (let i=0;i<10;i++){
    await page.reload();
    await expect(page.locator('h1, h2')).toContainText(/dashboard|application/i);
  }

  // Test Step 1 application route stability
  await page.goto(`${CLIENT}/apply/step-1`, { waitUntil: "domcontentloaded" });
  // Should load Step 1 or redirect gracefully
  await page.waitForSelector('body', { timeout: 5000 });

  for (let i=0;i<5;i++){
    await page.reload();
    await page.waitForSelector('body', { timeout: 5000 });
    // Should not crash or show blank page
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  }

  // New tab continuity test
  const p2 = await context.newPage();
  await p2.goto(`${CLIENT}/dashboard`);
  await expect(p2.locator('h1, h2')).toContainText(/dashboard|application/i);
});