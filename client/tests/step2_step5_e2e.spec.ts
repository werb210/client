import { test, expect } from '@playwright/test';

test('Step 2 selection persists & Step 5 shows category-driven docs', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bf:intake', JSON.stringify({
      amountRequested: 500000, country: 'CA', industry: 'construction', structure: 'corp'
    }));
    localStorage.removeItem('bf:step2'); localStorage.removeItem('bf:step2:category');
  });
  await page.goto('http://localhost:5000/apply/step-2');
  await page.waitForSelector('[data-step2-card]', { timeout: 10000 });

  // Click a category card/button
  const hit = page.locator('[data-step2-card]').first();
  await hit.click();

  // Verify persistence
  const saved = await page.evaluate(() => ({
    legacy: localStorage.getItem('bf:step2'),
    category: localStorage.getItem('bf:step2:category')
  }));
  expect(saved.legacy || saved.category).toBeTruthy();

  // Navigate to Step 5
  await page.goto('http://localhost:5000/apply/step-5');
  await page.waitForTimeout(1000);

  // Step 5 should show document requirements
  const docCards = page.locator('[data-doc-card]');
  await expect(docCards).toHaveCountGreaterThan(2);
  
  // Should show category-based messaging
  await expect(page.getByText(/Based on your profile.*selected category/i)).toBeVisible();
});
