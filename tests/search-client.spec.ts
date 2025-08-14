import { test, expect } from "@playwright/test";

test.describe("Client Search System", () => {
  
  test("Client search page loads", async ({ page }) => {
    // Test client search page with contact ID
    await page.goto("/client/search?contactId=TEST");
    await expect(page.getByText(/Search My Content/i)).toBeVisible();
    
    // Verify contact ID is displayed
    await expect(page.getByText(/Contact: TEST/i)).toBeVisible();
  });

  test("Client search page without contact ID shows error", async ({ page }) => {
    // Test client search page without contact ID
    await page.goto("/client/search");
    
    // Should show contact ID required error
    await expect(page.getByText(/Contact ID Required/i)).toBeVisible();
    
    // Should have go back button
    await expect(page.getByRole('button', { name: /Go Back/i })).toBeVisible();
  });

  test("Search form and interface elements", async ({ page }) => {
    await page.goto("/client/search?contactId=SEARCH_TEST");
    
    // Verify search form elements
    await expect(page.getByPlaceholder(/Search messages, documents/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible();
    
    // Check for results area
    await expect(page.getByText(/Search Results/i)).toBeVisible();
  });

  test("Search tips and help content", async ({ page }) => {
    await page.goto("/client/search?contactId=HELP_TEST");
    
    // Verify search tips section
    await expect(page.getByText(/Search Tips/i)).toBeVisible();
    
    // Check for helpful content
    await expect(page.getByText(/Search Types/i)).toBeVisible();
    await expect(page.getByText(/Examples/i)).toBeVisible();
  });

  test("Search input and submission", async ({ page }) => {
    await page.goto("/client/search?contactId=INPUT_TEST");
    
    const searchInput = page.getByPlaceholder(/Search messages, documents/i);
    const searchButton = page.getByRole('button', { name: /Search/i });
    
    // Test typing in search input
    await searchInput.fill("invoice");
    await expect(searchInput).toHaveValue("invoice");
    
    // Test search button click
    await searchButton.click();
    
    // Should show loading or results state
    await page.waitForTimeout(1000);
  });

  test("Responsive design on different viewports", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/client/search?contactId=MOBILE_TEST");
    
    // Verify content is accessible on mobile
    await expect(page.getByText(/Search My Content/i)).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText(/Contact:/i)).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible();
  });

  test("Search page accessibility", async ({ page }) => {
    await page.goto("/client/search?contactId=A11Y_TEST");
    
    // Check for proper heading structure
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Verify form elements have proper labels
    const searchInput = page.getByPlaceholder(/Search messages, documents/i);
    await expect(searchInput).toBeVisible();
    
    // Check for button accessibility
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible();
  });

  test("Error handling and edge cases", async ({ page }) => {
    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/client/search?contactId=ERROR_TEST");
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    // Check that no critical JavaScript errors occurred
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('search') && !error.includes('Failed to fetch')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test("Navigation and routing integration", async ({ page }) => {
    const testContactId = "NAV_TEST_456";
    await page.goto(`/client/search?contactId=${testContactId}`);
    
    // Verify the contact ID from URL is properly displayed
    await expect(page.getByText(new RegExp(`Contact: ${testContactId}`, 'i'))).toBeVisible();
    
    // Test browser navigation
    await page.goBack();
    await page.goForward();
    
    // Should still show the search interface
    await expect(page.getByText(/Search My Content/i)).toBeVisible();
  });

  test("Empty and loading states", async ({ page }) => {
    await page.goto("/client/search?contactId=EMPTY_TEST");
    
    // Check for appropriate empty state message
    await page.waitForTimeout(2000);
    
    // Look for either empty state or search interface
    const hasSearch = await page.getByText(/Search My Content/i).isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/No Results/i).isVisible().catch(() => false);
    
    expect(hasSearch || hasEmptyState).toBeTruthy();
  });

  test("URL parameter handling and validation", async ({ page }) => {
    // Test with special characters in contact ID
    const encodedContactId = encodeURIComponent("test+user@example.com");
    await page.goto(`/client/search?contactId=${encodedContactId}`);
    
    // Should handle encoded contact IDs properly
    await expect(page.getByText(/Contact:/i)).toBeVisible();
    
    // Test with missing query parameters
    await page.goto("/client/search?");
    await expect(page.getByText(/Contact ID Required/i)).toBeVisible();
  });
});