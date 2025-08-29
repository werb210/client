import { test, expect, request } from '@playwright/test';

const STAFF_API = process.env.VITE_STAFF_API_URL || 'https://staff.boreal.financial/api';
const TOKEN     = process.env.VITE_CLIENT_APP_SHARED_TOKEN || '';
const CLIENT_URL= process.env.CLIENT_URL || 'http://localhost:5000'; // your app URL

test('Client DB has all lender products in sync with Staff API', async ({ page }) => {
  // 1) Staff API fetch
  const api = await request.newContext({
    baseURL: STAFF_API,
    extraHTTPHeaders: { Authorization: `Bearer ${TOKEN}` }
  });
  const res = await api.get('/v1/products');
  expect(res.ok()).toBeTruthy();
  const serverProducts: any[] = await res.json();
  expect(Array.isArray(serverProducts)).toBeTruthy();
  expect(serverProducts.length).toBeGreaterThanOrEqual(44); // allow growth

  // 2) Client DB via audit hook
  await page.goto(CLIENT_URL, { waitUntil: 'domcontentloaded' });
  const hasHook = await page.evaluate(() => typeof (window as any).__audit_getLenderProducts === 'function');
  expect(hasHook).toBeTruthy();

  const clientProducts = await page.evaluate(async () => await (window as any).__audit_getLenderProducts());
  expect(Array.isArray(clientProducts)).toBeTruthy();

  // 3) Compare counts
  expect(clientProducts.length).toBeGreaterThanOrEqual(serverProducts.length);

  // 4) Compare ID sets (server must be subset of client DB)
  const serverIds = new Set(serverProducts.map(p => p.id));
  const clientIds = new Set(clientProducts.map((p:any) => p.id));
  const missingInClient = [...serverIds].filter(id => !clientIds.has(id));

  // Emit a friendly diff if mismatched
  if (missingInClient.length) {
    console.error('Missing in client DB:', missingInClient.slice(0,10));
  }
  expect(missingInClient.length, 'Every staff product should exist in client DB').toBe(0);
});