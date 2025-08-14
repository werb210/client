import { test, expect } from "@playwright/test";

test.describe("Document Packs & E-Signature", () => {
  
  test("Doc Pack tab shell loads", async ({ page }) => {
    // Test document packs management interface
    await page.goto("/applications/TEST/docs");
    await expect(page.getByText(/Document Packs/i)).toBeVisible();
  });

  test("Mock sign page loads", async ({ page }) => {
    // Test mock signing interface with parameters
    await page.goto("/client/sign/mock?pack=PK123&contact=C1");
    await expect(page.getByText(/Sign Documents/i)).toBeVisible();
    
    // Verify package information is displayed
    await expect(page.getByText(/Package ID/i)).toBeVisible();
    await expect(page.getByText(/PK123/)).toBeVisible();
    await expect(page.getByText(/C1/)).toBeVisible();
  });

  test("Mock sign page without parameters shows warning", async ({ page }) => {
    // Test mock signing interface without required parameters
    await page.goto("/client/sign/mock");
    
    // Should show missing parameters warning
    await expect(page.getByText(/Missing Required Parameters/i)).toBeVisible();
    
    // Sign button should be disabled
    await expect(page.getByRole('button', { name: /Accept & Sign/i })).toBeDisabled();
  });

  test("Mock signing flow functionality", async ({ page }) => {
    // Test the complete mock signing workflow
    await page.goto("/client/sign/mock?pack=TEST_PACK&contact=TEST_CONTACT");
    
    // Verify all document sections are visible
    await expect(page.getByText(/Documents to Sign/i)).toBeVisible();
    await expect(page.getByText(/Loan Agreement/i)).toBeVisible();
    await expect(page.getByText(/Security Agreement/i)).toBeVisible();
    
    // Verify next steps section
    await expect(page.getByText(/Next Steps/i)).toBeVisible();
    
    // Test sign button is enabled with parameters
    const signButton = page.getByRole('button', { name: /Accept & Sign/i });
    await expect(signButton).toBeEnabled();
    
    // Test cancel button functionality
    const cancelButton = page.getByRole('button', { name: /Cancel/i });
    await expect(cancelButton).toBeVisible();
    await expect(cancelButton).toBeEnabled();
  });

  test("Mock signing interface accessibility", async ({ page }) => {
    await page.goto("/client/sign/mock?pack=ACC_TEST&contact=ACC_USER");
    
    // Check for proper heading structure
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Sign Documents/i);
    
    // Verify buttons have proper labels
    await expect(page.getByRole('button', { name: /Accept & Sign/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();
    
    // Check for status indicators
    await expect(page.getByText(/Mock Signing Interface/i)).toBeVisible();
  });

  test("Document pack information display", async ({ page }) => {
    const packId = "DOC_PACK_789";
    const contactId = "CONTACT_456";
    
    await page.goto(`/client/sign/mock?pack=${packId}&contact=${contactId}`);
    
    // Verify package details section
    await expect(page.getByText(/Document Package Details/i)).toBeVisible();
    await expect(page.getByText(packId)).toBeVisible();
    await expect(page.getByText(contactId)).toBeVisible();
    
    // Verify document checklist
    await expect(page.getByText(/Personal Guarantee/i)).toBeVisible();
    await expect(page.getByText(/Disclosure Statements/i)).toBeVisible();
  });

  test("Mock signing error handling", async ({ page }) => {
    // Monitor console errors during signing process
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/client/sign/mock?pack=ERROR_TEST&contact=ERROR_USER");
    
    // Wait for page to fully load
    await page.waitForTimeout(1000);
    
    // Check that no critical errors occurred during page load
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('signing') || 
      error.includes('document') || 
      error.includes('pack')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test("Navigation and routing integration", async ({ page }) => {
    // Test that the mock signing page integrates properly with routing
    await page.goto("/client/sign/mock?pack=NAV_TEST&contact=NAV_USER");
    
    // Verify the page loads without routing errors
    await expect(page.getByText(/Sign Documents/i)).toBeVisible();
    
    // Test browser navigation
    await page.goBack();
    await page.goForward();
    
    // Should still show the signing interface
    await expect(page.getByText(/Sign Documents/i)).toBeVisible();
  });

  test("Responsive design verification", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/client/sign/mock?pack=MOBILE_TEST&contact=MOBILE_USER");
    
    // Verify content is still accessible on mobile
    await expect(page.getByText(/Sign Documents/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Accept & Sign/i })).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText(/Document Package Details/i)).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByText(/Documents to Sign/i)).toBeVisible();
  });
});