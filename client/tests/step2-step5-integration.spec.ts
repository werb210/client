import { test, expect } from '@playwright/test';

test('Step 2 category selection integrates with Step 5 document requirements', async ({ page }) => {
  // Seed Step 1 intake data
  await page.addInitScript(() => {
    localStorage.setItem('bf:intake', JSON.stringify({
      amountRequested: 50000,
      country: 'CA',
      industry: 'construction',
      structure: 'corp'
    }));
  });

  // Hook submission to capture final payload
  await page.addInitScript(() => {
    const origFetch = window.fetch;
    (window as any).__submitResult = null;
    window.fetch = async (...args) => {
      const [url, init] = args;
      const isSubmit = typeof url === 'string' && /\/api\/v1\/applications\b/.test(url) && (init?.method||'GET').toUpperCase()==='POST';
      const res = await origFetch(...args);
      if (isSubmit) {
        try {
          const data = await res.clone().json();
          (window as any).__submitResult = { ok: res.ok, status: res.status, data };
          console.log('[PLAYWRIGHT] SUBMISSION PAYLOAD:', JSON.stringify(data, null, 2));
        } catch (e) {
          console.log('[PLAYWRIGHT] Failed to parse submission response');
        }
      }
      return res;
    };
  });

  console.log('🔄 Starting Step 2 → Step 5 integration test...');

  // Step 2: Navigate and select category
  await page.goto('http://localhost:5000/apply/step-2');
  await page.waitForSelector('[data-step2-card]', { timeout: 10000 });
  
  // Get available categories
  const categories = await page.locator('[data-step2-card]').count();
  console.log(`📋 Found ${categories} categories on Step 2`);
  
  // Select the first category (should be highest scored)
  const firstCard = page.locator('[data-step2-card]').first();
  const categoryId = await firstCard.getAttribute('data-step2-card');
  console.log(`🎯 Selecting category: ${categoryId}`);
  
  await firstCard.click();
  
  // Wait a moment for the selection to register
  await page.waitForTimeout(500);
  
  // Verify the category was saved to storage
  const savedCategory = await page.evaluate(() => {
    return localStorage.getItem('bf:step2');
  });
  console.log('💾 Saved Step 2 data:', savedCategory);
  
  // Navigate to Step 5 directly
  await page.goto('http://localhost:5000/apply/step-5');
  await page.waitForTimeout(1000);
  
  // Check if Step 5 shows document requirements
  const docCards = await page.locator('[data-doc-card]').count();
  console.log(`📄 Step 5 shows ${docCards} document requirements`);
  
  // Verify Step 5 shows the category information
  const categoryInfo = page.getByText(/Based on your profile.*selected category/i);
  await expect(categoryInfo).toBeVisible();
  console.log('✅ Step 5 displays category-based document requirements');
  
  // Check for base documents that should always be present
  await expect(page.locator('[data-doc-card="bank_statements_6m"]')).toBeVisible();
  await expect(page.locator('[data-doc-card="tax_returns_3y"]')).toBeVisible();
  await expect(page.locator('[data-doc-card="financial_statements"]')).toBeVisible();
  console.log('✅ Base documents are present in Step 5');
  
  // Check for category-specific documents based on selection
  if (categoryId === 'invoice_factoring') {
    await expect(page.locator('[data-doc-card="ar_aging"]')).toBeVisible();
    await expect(page.locator('[data-doc-card="invoice_samples"]')).toBeVisible();
    console.log('✅ Invoice factoring specific documents shown');
  } else if (categoryId === 'equipment_financing') {
    await expect(page.locator('[data-doc-card="equipment_quote"]')).toBeVisible();
    console.log('✅ Equipment financing specific documents shown');
  }
  
  // Check for amount-based documents (≥$25k should require personal guarantee)
  await expect(page.locator('[data-doc-card="personal_financial_statement"]')).toBeVisible();
  await expect(page.locator('[data-doc-card="pg_authorization"]')).toBeVisible();
  console.log('✅ Amount-based documents shown for $50k request');
  
  console.log('🎉 Step 2 → Step 5 integration test completed successfully!');
});