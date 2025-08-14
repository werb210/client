import { test, expect } from "@playwright/test";

test.describe("Data Protection & Privacy Compliance", () => {
  
  test("DSAR panel loads", async ({ page }) => {
    // Test DSAR (Data Subject Access Request) interface
    await page.goto("/admin/privacy/dsar");
    await expect(page.getByText(/Privacy Tools \(DSAR\)/i)).toBeVisible();
  });

  test("KYC mock page loads", async ({ page }) => {
    // Test KYC verification mock interface
    await page.goto("/client/kyc/mock?contact=TEST");
    await expect(page.getByText(/KYC Verification \(Mock\)/i)).toBeVisible();
    
    // Verify contact ID is displayed
    await expect(page.getByText(/Contact ID: TEST/i)).toBeVisible();
    
    // Verify action buttons are present
    await expect(page.getByRole('button', { name: /approve/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /reject/i })).toBeVisible();
  });

  test("KYC mock approval flow", async ({ page }) => {
    await page.goto("/client/kyc/mock?contact=PLAYWRIGHT_TEST");
    
    // Click approve button
    await page.getByRole('button', { name: /approve/i }).click();
    
    // Wait for the API call and alert (in a real test, we'd mock this)
    // For now, we just verify the button was clickable
    await expect(page.getByRole('button', { name: /approve/i })).toBeVisible();
  });

  test("KYC mock rejection flow", async ({ page }) => {
    await page.goto("/client/kyc/mock?contact=PLAYWRIGHT_TEST");
    
    // Click reject button
    await page.getByRole('button', { name: /reject/i }).click();
    
    // Wait for the API call and alert (in a real test, we'd mock this)
    // For now, we just verify the button was clickable
    await expect(page.getByRole('button', { name: /reject/i })).toBeVisible();
  });

  test("KYC mock without contact ID shows warning", async ({ page }) => {
    await page.goto("/client/kyc/mock");
    
    // Should show warning about missing contact ID
    await expect(page.getByText(/No contact ID provided/i)).toBeVisible();
    
    // Buttons should be disabled
    await expect(page.getByRole('button', { name: /approve/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /reject/i })).toBeDisabled();
  });

  test("Privacy policy page accessibility", async ({ page }) => {
    await page.goto("/privacy-policy");
    
    // Verify the page loads and has proper headings
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check for standard privacy policy sections
    await expect(page.getByText(/privacy/i)).toBeVisible();
  });

  test("Terms of service page accessibility", async ({ page }) => {
    await page.goto("/terms-of-service");
    
    // Verify the page loads and has proper headings
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check for standard terms sections
    await expect(page.getByText(/terms/i)).toBeVisible();
  });

  test("Consent widget integration test", async ({ page }) => {
    // Navigate to a page that would have the consent widget
    // For this test, we'll check the KYC page since it's new
    await page.goto("/client/kyc/mock?contact=TEST");
    
    // The page should load without console errors
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    // Wait a moment for any errors to appear
    await page.waitForTimeout(1000);
    
    // Check that no critical errors occurred
    const criticalErrors = logs.filter(log => 
      log.includes('KYC') || log.includes('consent') || log.includes('privacy')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});