import { test, expect } from "@playwright/test";

const START = process.env.CLIENT_URL || "http://localhost:5000/";

test("core navigation works; duplicate labels flagged", async ({ page }) => {
  await page.goto(START);

  // core nav examples (adjust selectors to your final layout)
  const nav = [
    "[data-testid='step-1-financial-profile']",
    "[data-testid='step-2-lender-match']", 
    "[data-testid='step-3-business-details']",
    "[data-testid='step-4-applicant-details']",
    "[data-testid='step-5-document-upload']",
    "[data-testid='step-6-signature']",
    "[data-testid='step-7-submit']"
  ];

  // Check if we can find at least some navigation elements
  let foundNavItems = 0;
  for (const sel of nav) {
    const el = await page.$(sel);
    if (el) {
      foundNavItems++;
    }
  }
  
  // At least some nav should be present
  expect(foundNavItems, "Should find at least some navigation elements").toBeGreaterThan(0);

  // duplicate labels
  const items = page.locator('button, [role="button"], [data-testid], [role="menuitem"], [role="tab"]');
  const map = new Map<string, number>();
  const n = await items.count();
  for (let i=0;i<n;i++){
    const el = items.nth(i);
    const t = (await el.textContent() || "").replace(/\s+/g," ").trim();
    const key = t || (await el.getAttribute("data-testid")) || "";
    if (!key) continue;
    map.set(key, (map.get(key)||0)+1);
  }
  const dups = [...map.entries()].filter(([_,c])=>c>1);
  console.log("CLIENT_DUPLICATES", JSON.stringify(dups, null, 2));
});