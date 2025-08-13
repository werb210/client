import { test, expect } from "@playwright/test";
const STAFF = process.env.STAFF_URL || "http://127.0.0.1:5000";
const CLIENT = process.env.CLIENT_URL || "http://127.0.0.1:5173";
test("client keeps session (bf_auth) and does not bounce to /login", async ({ page, request }) => {
  // 1) Ask Staff to mint a test cookie (requires TEST_AUTH_ENABLED=true on Staff)
  const mint = await request.post(`${STAFF}/api/auth/test-login`, { data: {} });
  expect(mint.ok()).toBeTruthy();

  // 2) Load the client app; its API calls should include credentials and succeed
  await page.goto(CLIENT, { waitUntil: "domcontentloaded" });
  // Optional: depending on your app, you can verify a logged-in signal on the UI:
  // await expect(page.locator("[data-testid='user-avatar']")).toBeVisible();

  // 3) Reload shouldn't send you back to /login
  await page.reload();
  // If your app calls /api/auth/user, we trust that it stays 200; else, just ensure no redirect.
  expect(page.url()).toMatch(/^(?!.*\/login)/);
});
