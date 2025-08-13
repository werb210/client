import { test, expect } from "@playwright/test";
const START = process.env.CLIENT_URL || "http://127.0.0.1:5173/";
const SLOW_MS = Number(process.env.SLOW_API_MS || 1500);
test("runtime guard: no console errors, no broken/slow APIs", async ({ page }) => {
  const errors:string[] = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  const bad:string[] = [];
  page.on("response", async r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
  await page.goto(START);
  await page.waitForLoadState("networkidle");
  const perf = await page.evaluate(() => performance.getEntriesByType("resource")
    .filter((e:any) => e.initiatorType === "fetch" || e.initiatorType === "xmlhttprequest")
    .map((e:any) => ({ name: (e as any).name, duration: (e as any).duration })));
  const slow = (perf as any[]).filter(p => p.duration > SLOW_MS);
  expect(errors, "Console errors").toHaveLength(0);
  expect(bad, "Broken network calls").toHaveLength(0);
  expect(slow, `Slow API calls > ${SLOW_MS}ms`).toHaveLength(0);
});
