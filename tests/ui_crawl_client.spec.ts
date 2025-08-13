import { test, expect } from "@playwright/test";
const START = process.env.CLIENT_URL || "http://127.0.0.1:5173/";
test("UI crawl: nav present & duplicates snapshot", async ({ page }) => {
  await page.goto(START, { waitUntil: "domcontentloaded" });
  const navSelectors = [
    "[data-testid='nav-start-application']",
    "[data-testid='nav-documents']",
    "[data-testid='nav-recommendations']",
    "[data-testid='nav-help']",
  ];
  for (const sel of navSelectors) {
    const el = await page.$(sel);
    expect(el, `Missing nav item ${sel}`).not.toBeNull();
  }
  const elems = page.locator('button,[role="button"],[data-testid],[role="menuitem"],[role="tab"]');
  const map = new Map<string, number>();
  const n = await elems.count();
  for (let i=0;i<n;i++){
    const el = elems.nth(i);
    const text = (await el.textContent()||"").replace(/\s+/g," ").trim();
    const key = text || (await el.getAttribute("data-testid")) || "";
    if (!key) continue;
    map.set(key, (map.get(key)||0)+1);
  }
  const dups = [...map.entries()].filter(([_,c])=>c>1);
  console.log("CLIENT_RUNTIME_DUPLICATES", JSON.stringify(dups, null, 2));
});
