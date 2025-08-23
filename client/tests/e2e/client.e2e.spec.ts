import { test, expect } from "@playwright/test";

const CLIENT_URL = process.env.CLIENT_URL || "https://client.boreal.financial";
const STAFF_API = process.env.STAFF_API || "https://staff.boreal.financial";
const CLIENT_TOKEN = process.env.CLIENT_TOKEN;

test.describe("Client App - Lender Products Integration", () => {
  test("fetches lender products successfully", async ({ request }) => {
    const res = await request.get(`${STAFF_API}/api/lender-products`, {
      headers: { Authorization: `Bearer ${CLIENT_TOKEN}` },
    });

    expect(res.ok()).toBeTruthy();
    const products = await res.json();
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThanOrEqual(32);
  });
});

test.describe("Client App - UI Navigation", () => {
  test("navigates between lender products without opening new tabs", async ({ page }) => {
    await page.goto(`${CLIENT_URL}/lenders`);

    const firstLink = page.locator("a[href^='/lender/']").first();
    await firstLink.click();

    // Should NOT open a new tab; URL should change in the same tab
    expect(page.url()).toContain("/lender/");
  });
});

test.describe("Client App - Schema Validation", () => {
  test("compares client schema to staff schema lock", async ({ request }) => {
    const res = await request.get(`${STAFF_API}/api/schema/hash`, {
      headers: { Authorization: `Bearer ${CLIENT_TOKEN}` },
    });

    expect(res.ok()).toBeTruthy();
    const { currentHash, lockedHash } = await res.json();
    expect(currentHash).toBe(lockedHash);
  });
});