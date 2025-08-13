import { test, expect } from "@playwright/test";

const START = process.env.CLIENT_URL || "http://localhost:5000/";

test("client no console errors and no broken network calls", async ({ page }) => {
  const errors:string[] = [];
  page.on("console", (msg) => { if (msg.type()==="error") errors.push(msg.text()); });

  const failures:string[] = [];
  page.on("response", async r => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
  });

  await page.goto(START);
  await page.waitForLoadState("networkidle");

  if (errors.length) throw new Error("Console errors:\n" + errors.join("\n"));
  expect(failures, "Broken network calls").toHaveLength(0);
});