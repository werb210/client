import { test, expect } from "@playwright/test";
const START = process.env.CLIENT_URL || "http://localhost:5000/";
test("duplicate labels/testIDs and basic nav present", async ({ page }) => {
  await page.goto(START);
  const items=page.locator('button,[role="button"],[data-testid],[role="menuitem"],[role="tab"]');
  const map=new Map<string,number>(); const n=await items.count();
  for(let i=0;i<n;i++){
    const el=items.nth(i);
    const t=(await el.textContent()||"").replace(/\s+/g," ").trim();
    const key=t||(await el.getAttribute("data-testid"))||"";
    if(!key) continue;
    map.set(key,(map.get(key)||0)+1);
  }
  const dups=[...map.entries()].filter(([_,c])=>c>1);
  console.log("CLIENT_DUPLICATES", JSON.stringify(dups, null, 2));
  // Adjust to your nav ids if needed
  for (const sel of ["[data-testid='nav-start-application']","[data-testid='nav-documents']","[data-testid='nav-recommendations']","[data-testid='nav-help']"]) {
    const el = await page.$(sel);
    expect(el, `Missing nav item ${sel}`).not.toBeNull();
  }
});