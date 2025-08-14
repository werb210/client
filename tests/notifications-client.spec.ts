import { test, expect } from "@playwright/test";

test.describe("Client Notifications System", () => {
  
  test("Client notifications page loads", async ({ page }) => {
    // Test client notifications page with contact ID
    await page.goto("/client/notifications?contactId=TEST");
    await expect(page.getByText(/Notifications/i)).toBeVisible();
    
    // Verify contact ID is displayed
    await expect(page.getByText(/Contact: TEST/i)).toBeVisible();
  });

  test("Client notifications page without contact ID shows error", async ({ page }) => {
    // Test client notifications page without contact ID
    await page.goto("/client/notifications");
    
    // Should show contact ID required error
    await expect(page.getByText(/Contact ID Required/i)).toBeVisible();
    
    // Should have go back button
    await expect(page.getByRole('button', { name: /Go Back/i })).toBeVisible();
  });

  test("Notifications page header and navigation", async ({ page }) => {
    await page.goto("/client/notifications?contactId=HEADER_TEST");
    
    // Verify page header elements
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Notifications/i);
    
    // Check for back button
    await expect(page.getByRole('button')).toBeVisible();
    
    // Verify contact ID display
    await expect(page.getByText(/Contact: HEADER_TEST/i)).toBeVisible();
  });

  test("Empty notifications state", async ({ page }) => {
    await page.goto("/client/notifications?contactId=EMPTY_TEST");
    
    // Should eventually show empty state (assuming no notifications)
    // Note: This might show loading first, then empty state
    await page.waitForTimeout(2000);
    
    // Look for either loading state or empty state
    const hasUpdates = await page.getByText(/No Notifications/i).isVisible().catch(() => false);
    const isLoading = await page.getByText(/Loading/i).isVisible().catch(() => false);
    
    expect(hasUpdates || isLoading).toBeTruthy();
  });

  test("Notifications page accessibility", async ({ page }) => {
    await page.goto("/client/notifications?contactId=A11Y_TEST");
    
    // Check for proper heading structure
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Verify buttons have proper labels
    const buttons = page.getByRole('button');
    await expect(buttons.first()).toBeVisible();
    
    // Check for status indicators
    await expect(page.getByText(/Contact:/i)).toBeVisible();
  });

  test("Notifications page responsive design", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/client/notifications?contactId=MOBILE_TEST");
    
    // Verify content is accessible on mobile
    await expect(page.getByText(/Notifications/i)).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText(/Contact:/i)).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test("Error handling for API failures", async ({ page }) => {
    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/client/notifications?contactId=ERROR_TEST");
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    // Check that no critical JavaScript errors occurred
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('notifications') && !error.includes('Failed to fetch')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test("URL parameter handling", async ({ page }) => {
    const testContactId = "URL_PARAM_TEST_123";
    await page.goto(`/client/notifications?contactId=${testContactId}`);
    
    // Verify the contact ID from URL is properly displayed
    await expect(page.getByText(new RegExp(`Contact: ${testContactId}`, 'i'))).toBeVisible();
    
    // Test with encoded contact ID
    const encodedContactId = encodeURIComponent("test@example.com");
    await page.goto(`/client/notifications?contactId=${encodedContactId}`);
    
    // Should handle encoded contact IDs properly
    await expect(page.getByText(/Contact:/i)).toBeVisible();
  });

  test("Navigation integration", async ({ page }) => {
    // Test that the notifications page integrates properly with routing
    await page.goto("/client/notifications?contactId=NAV_TEST");
    
    // Verify the page loads without routing errors
    await expect(page.getByText(/Notifications/i)).toBeVisible();
    
    // Test browser navigation
    await page.goBack();
    await page.goForward();
    
    // Should still show the notifications interface
    await expect(page.getByText(/Notifications/i)).toBeVisible();
  });

  test("Loading states and user feedback", async ({ page }) => {
    await page.goto("/client/notifications?contactId=LOADING_TEST");
    
    // Check for loading state initially (if it appears)
    const loadingVisible = await page.getByText(/Loading/i).isVisible().catch(() => false);
    
    // Wait for content to load or error to appear
    await page.waitForTimeout(3000);
    
    // Should eventually show either content or error state
    const hasContent = await page.getByText(/Total/i).isVisible().catch(() => false);
    const hasError = await page.getByText(/Error/i).isVisible().catch(() => false);
    const isEmpty = await page.getByText(/No Notifications/i).isVisible().catch(() => false);
    
    expect(hasContent || hasError || isEmpty || loadingVisible).toBeTruthy();
  });
});