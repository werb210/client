import { test, expect } from '@playwright/test';

test('canonical submit happy path', async ({ page }) => {
  await page.goto('http://localhost:5000/apply/step-1');
  await page.fill('[name="businessLocation"]','US');
  await page.fill('[name="industry"]','manufacturing');
  await page.fill('[name="fundingAmount"]','250000');
  await page.click('text=Next'); // step 2
  await page.goto('http://localhost:5000/submit'); // a route that renders <FinalSubmit/>
  
  const [resp] = await Promise.all([
    page.waitForResponse(/\/api\/applications$/),
    page.click('text=Submit Application'),
  ]);
  
  expect(resp.ok()).toBeTruthy();
});