import { test, expect } from "@playwright/test";

test("Chatbot greets and captures name+email", async ({ page }) => {
  await page.goto(process.env.CLIENT_BASE || "http://localhost:5000", { waitUntil: "domcontentloaded" });

  // open widget (adjust selector to your chat button)
  await page.getByRole("button", { name: /finbot|chat|need help/i }).click();

  // 1) welcome appears
  await expect(page.getByText(/hi|hello|welcome/i)).toBeVisible({ timeout: 5000 });

  // 2) name prompt
  await page.getByRole("textbox").fill("Jane Tester");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/great|thanks.*jane/i)).toBeVisible({ timeout: 5000 });

  // 3) email prompt
  await page.getByRole("textbox").fill("jane.tester@example.com");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/consent|email ok|privacy/i)).toBeVisible({ timeout: 5000 });

  // 4) consent "yes"
  await page.getByRole("textbox").fill("yes");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/you're all set|ready|ask me/i)).toBeVisible({ timeout: 5000 });
});