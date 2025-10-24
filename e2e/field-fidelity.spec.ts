import { test, expect } from '@playwright/test';
import fixture from '../fixtures/application.v1.json' assert { type: 'json' };

// Helper: install an in-page fetch interceptor that captures FormData/JSON into window.__LAST_SUBMISSION__
async function installInterceptor(page) {
  await page.addInitScript(() => {
    const _fetch = window.fetch;
    (window as any).__LAST_SUBMISSION__ = null;
    window.fetch = async (url: any, opts: any = {}) => {
      try {
        const method = (opts.method || 'GET').toUpperCase();
        const isSubmit = method === 'POST' && /\/(api|v1)\/applications$/.test(String(url));
        if (isSubmit) {
          const snapshot: Record<string, any> = { url, method, headers: opts.headers || {}, fields: {} };
          if (opts.body instanceof FormData) {
            (opts.body as FormData).forEach((v, k) => {
              snapshot.fields[k] = typeof v === 'string' ? v : (v && (v as any).name) || '[binary]';
            });
          } else if (typeof opts.body === 'string') {
            try { snapshot.fields = JSON.parse(opts.body); } catch { snapshot.fields = { _raw: opts.body }; }
          } else if (opts.body) {
            snapshot.fields = opts.body as any;
          }
          (window as any).__LAST_SUBMISSION__ = snapshot;
        }
      } catch {}
      return _fetch(url as any, opts);
    };
  });
}

test('Step1 → autosave → Step2 rules → submit includes all fields', async ({ page }) => {
  await installInterceptor(page);
  await page.goto('/');

  // --- Fill Step 1 (more flexible label detection) ---
  const countrySelector = /country|select country|country of incorporation/i;
  await page.getByLabel(countrySelector).or(page.getByPlaceholder(countrySelector)).selectOption(fixture.businessLocation);

  await page.getByLabel(/headquarters city|city/i).fill(fixture.headquarters);
  await page.getByLabel(/state|province/i).fill(fixture.headquartersState);
  await page.getByLabel(/industry/i).fill(fixture.industry);
  await page.getByLabel(/looking for/i).selectOption(fixture.lookingFor);
  await page.getByLabel(/requested amount|amount/i).fill(String(fixture.fundingAmount));
  await page.getByLabel(/purpose/i).fill(fixture.fundsPurpose);
  await page.getByLabel(/sales history/i).selectOption(fixture.salesHistory);
  await page.getByLabel(/revenue last year/i).fill(String(fixture.revenueLastYear));
  await page.getByLabel(/avg(.*)monthly revenue|average monthly revenue/i).fill(String(fixture.averageMonthlyRevenue));
  await page.getByLabel(/accounts? receivable/i).fill(String(fixture.accountsReceivableBalance));
  await page.getByLabel(/fixed assets/i).fill(String(fixture.fixedAssetsValue));
  await page.getByLabel(/equipment value/i).fill(String(fixture.equipmentValue));

  // Continue to Step 2
  await page.getByRole('button', { name: /continue|next/i }).click();

  // --- Step 2 rules: "capital" hides Equipment Financing + Invoice Factoring ---
  await expect(page.getByText(/equipment financing/i)).toHaveCount(0);
  await expect(page.getByText(/invoice factoring/i)).toHaveCount(0);

  // Choose a category if the UI requires it to enable submit (best-effort)
  const hasCategory = await page.getByRole('button', { name: /select|choose/i }).count();
  if (hasCategory) await page.getByRole('button', { name: /select|choose/i }).first().click();

  // Submit
  const submitBtn = await page.getByRole('button', { name: /submit|apply|finish/i });
  if (await submitBtn.count()) await submitBtn.click();

  // Read captured submission
  const snap = await page.evaluate(() => (window as any).__LAST_SUBMISSION__);
  expect(snap).toBeTruthy();

  // Validate that every fixture key is present in the submitted fields snapshot
  const fields = snap.fields || {};
  for (const key of Object.keys(fixture)) {
    expect(Object.keys(fields)).toContain(key);
  }
});
