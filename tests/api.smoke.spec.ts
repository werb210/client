import { test, expect, request } from '@playwright/test';

const BASE = process.env.VITE_STAFF_API_URL || 'https://staff.boreal.financial/api';
const TOK  = process.env.VITE_CLIENT_APP_SHARED_TOKEN || '';

test.describe('Client↔Staff API smoke', () => {
  test('products list returns expected count', async ({ playwright }) => {
    const api = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { Authorization: `Bearer ${TOK}` }});
    const res = await api.get('/v1/products');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThanOrEqual(44); // allow >= in case catalog grows
  });

  test('lenders list returns expected count', async ({ playwright }) => {
    const api = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { Authorization: `Bearer ${TOK}` }});
    const res = await api.get('/lenders');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThanOrEqual(30);
  });

  test('validate-intake (old schema) responds with ok flag', async ({ playwright }) => {
    const api = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { Authorization: `Bearer ${TOK}`, 'Content-Type': 'application/json' }});
    const res = await api.post('/applications/validate-intake', { data: { product_id: 'PRODUCT_ID', country: 'US', amount: 25000 }});
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(typeof data.ok).toBe('boolean');
  });

  test('validate-intake (new schema) responds with ok flag', async ({ playwright }) => {
    const api = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { Authorization: `Bearer ${TOK}`, 'Content-Type': 'application/json' }});
    const res = await api.post('/applications/validate-intake', { data: { business: { name: 'Co' }, owners: [{ name: 'A' }], amountRequested: 50000 }});
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(typeof data.ok).toBe('boolean');
  });
});