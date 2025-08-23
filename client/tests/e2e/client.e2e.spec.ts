import { test, expect } from "@playwright/test";

test("Client fetches all 32 lender products", async ({ request }) => {
  const res = await request.get(
    "https://staff.boreal.financial/api/lender-products",
    {
      headers: {
        Authorization: `Bearer ${process.env.VITE_CLIENT_TOKEN}`,
      },
    }
  );
  expect(res.status()).toBe(200);
  const products = await res.json();
  expect(products.length).toBe(32);
});