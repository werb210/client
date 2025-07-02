Below is a **single, copy-pasteable instruction set** you can drop into your *client-app* README (or into a new ticket for Replit).
It tells the client code-gen agent **exactly** how to consume — and stay in-sync with — the **new, expanded /api/public/lenders** schema that the Staff portal now exposes.

---

## 📜 CLIENT V2 — Lender-Product Schema Alignment Checklist (“Do THIS now”)

### 0. Pre-flight

```bash
# one-liner to pull the fresh OpenAPI file straight from Staff
curl -s https://staffportal.replit.app/api/public/openapi.json \
  -o ./src/api/__generated__/staff.openapi.json
```

<br/>

### 1. Generate **strongly-typed** client SDK from that OpenAPI file

```bash
npx openapi-typescript ./src/api/__generated__/staff.openapi.json \
  -o ./src/api/__generated__/staff.d.ts
npx openapi-typescript-fetch \
  --input  ./src/api/__generated__/staff.openapi.json \
  --output ./src/api/__generated__/staffClient.ts
```

*No manual type-sync headaches ever again.*

<br/>

### 2. Replace the old `LenderProduct` interface & hook

```diff
- // src/types/LenderProduct.ts
- export interface LenderProduct {
-   id: string
-   lenderName: string
-   productName: string
-   category: string
-   minAmount: number
-   maxAmount: number
- }
+ // DO NOT hand-edit.  The type now lives in:
+ // import { components } from '@/api/__generated__/staff'
+ // export type LenderProduct = components["schemas"]["LenderProduct"]

- // src/hooks/useLenderProducts.ts
- const fetcher = () => apiClient.get('/public/lenders').then(res => res.data)
+ import { createClient }   from '@/api/__generated__/staffClient'
+ const staff = createClient({ baseUrl: import.meta.env.VITE_STAFF_API })
+
+ export const useLenderProducts = () =>
+   useQuery(['lenderProducts'], () =>
+     staff.publicLendersList({ /* optional filters later */ })
+   )
```

<br/>

### 3. Update every component that touches lender data

Search-replace the old dotted fields → new camel-cased ones:

| **Old**                   | **New (v2 schema)**                                                        |
| ------------------------- | -------------------------------------------------------------------------- |
| `lenderName`              | `lender`                                                                   |
| `productName`             | `product`                                                                  |
| `category`                | `productCategory`                                                          |
| `minAmount` / `maxAmount` | `minAmountUsd` / `maxAmountUsd`                                            |
| *(all new fields)*        | `interestRateMin`, `interestRateMax`, `termMinMonths`, `requiredDocs[]`, … |

```tsx
// Example fix in ProductCard.tsx
- <span>{item.lenderName}</span>
+ <span>{item.lender}</span>

- {item.minAmount.toLocaleString('en-US',{style:'currency',currency:'USD'})}
+ {item.minAmountUsd.toLocaleString('en-US',{style:'currency',currency:'USD'})}
```

<br/>

### 4. Refactor **client-side filters / sorters**

```diff
- const byAmount = (a,b) => a.minAmount - b.minAmount
+ const byAmount = (a,b) => a.minAmountUsd - b.minAmountUsd

- const categoryOptions = ['working_capital','equipment_financing']
+ const categoryOptions = [
+   'Working Capital','Equipment Financing','Asset-Based Lending',
+   'Purchase Order Financing','Invoice Factoring',
+   'Business Line of Credit','Term Loan','SBA Loan'
+ ]
```

<br/>

### 5. Surface **the extra data** in the UI (optional but recommended)

* Add a collapsible “Details” accordion beneath each product card that maps:

| Label                | Field                             |
| -------------------- | --------------------------------- |
| “Term (months)”      | `termMinMonths` – `termMaxMonths` |
| “Rate Type”          | `rateType`                        |
| “Interest Frequency” | `interestFrequency`               |
| “Docs Needed”        | `requiredDocs.join(', ')`         |

```tsx
{/* inside ProductCard */}
<Accordion>
  <AccordionTrigger>View details</AccordionTrigger>
  <AccordionContent>
    <dl className="grid grid-cols-2 gap-2 text-sm">
      <dt>Term</dt><dd>{p.termMinMonths}-{p.termMaxMonths} mo</dd>
      <dt>Rate Type</dt><dd>{p.rateType}</dd>
      <dt>Frequency</dt><dd>{p.interestFrequency}</dd>
      <dt>Docs</dt><dd>{p.requiredDocs.join(', ')}</dd>
    </dl>
  </AccordionContent>
</Accordion>
```

<br/>

### 6. QA / E2E checkpoints

1. `npm run typecheck` → should be **green**
2. `npm run dev` → *network tab* returns 43 products, no 404s
   3. Manual smoke-test filters / sorts
   4. If something fails, regenerate SDK (`step 1`) – the contract rules!

<br/>

### 7. CI guardrail (prevent future drift)

Add to **.github/workflows/ci.yml**

```yaml
- name: Check lender schema drift
  run: |
    curl -s ${{ secrets.STAFF_OPENAPI }} -o staff.latest.json
    diff -q staff.latest.json src/api/__generated__/staff.openapi.json && echo "✓ schema unchanged" || (echo "❌ schema changed – regenerate SDK"; exit 1)
```

---

### 🔑 Key idea

Stop hand-rolling types & fetchers. **Generate them directly from Staff’s OpenAPI** – the client will *never* get out-of-sync with whatever the Staff team adds to the lender-product schema.

Drop these instructions into Replit ➜ “Run” – the agent will scaffold the SDK, patch the hooks, and refactor every component that still references the old fields.
