import { test, expect } from "@playwright/test";
const CLIENT = process.env.CLIENT_BASE || "http://localhost:5000";
const STAFF = process.env.STAFF_BASE || "http://localhost:5000";

test("Full fill → submit → staff presence", async ({ page, request }) => {
  // Step 1 fill (UPDATE SELECTORS to your actual inputs)
  await page.goto(`${CLIENT}/apply/step-1`);
  await page.locator('[name="industry"]').fill("Software");
  await page.locator('[name="lookingFor"]').selectOption("capital");
  await page.locator('[name="fundingAmount"]').fill("250000");
  await page.waitForTimeout(250); // allow autosave

  // Navigate to Step 2 to ensure rules consume Step 1
  await page.goto(`${CLIENT}/apply/step-2`);
  // Expect excluded categories not visible if lookingFor=='capital' (customize)
  await expect(page.getByText("Equipment Financing")).toHaveCount(0);

  // Jump to final submit page & submit (customize route/button)
  await page.goto(`${CLIENT}/apply/step-7`);
  const [resp] = await Promise.all([
    page.waitForResponse(r => /\/api\/applications$/.test(r.url()) && r.request().method() === "POST"),
    page.getByRole("button", { name: /submit/i }).click()
  ]);
  expect(resp.ok()).toBeTruthy();

  // Verify presence report via staff API (edit to real endpoint)
  const list = await request.get(`${STAFF}/api/applications?limit=1`);
  expect(list.ok()).toBeTruthy();
});