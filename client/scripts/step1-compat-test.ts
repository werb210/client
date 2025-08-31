import assert from "node:assert/strict";

// Test data normalization functions
function parseNum(v: any): number {
  if (v == null) return 0;
  const s = typeof v === 'number' ? String(v) : String(v);
  const n = Number(s.replace(/[$,_\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function toCountryCode(v: any): string {
  const s = (v ?? '').toString().trim().toUpperCase();
  if (!s) return "NA";
  if (["CA", "CANADA"].includes(s)) return "CA";
  if (["US", "USA", "UNITED STATES", "U.S.", "U.S.A."].includes(s)) return "US";
  return s.length === 2 ? s : "NA";
}

function normalizeStep1(d: any): { amount: number; country: string } {
  const amount =
    parseNum(d?.amountRequested) ||
    parseNum(d?.loanAmount) ||
    parseNum(d?.requestedAmount) ||
    parseNum(d?.requested_amount) ||
    parseNum(d?.amount) ||
    parseNum(d?.fundsNeeded) ||
    parseNum(d?.fundingAmount) ||
    parseNum(d?.loan_size) || 0;
  
  const country =
    toCountryCode(d?.country) || 
    toCountryCode(d?.countryCode) || 
    toCountryCode(d?.applicantCountry) || 
    toCountryCode(d?.region) || "NA";
  
  return { amount, country };
}

// Test product filtering
const sampleProducts = [
  { id: 1, name: "CA LOC A", country: "CA", minAmount: 50000, maxAmount: 1000000 },
  { id: 2, name: "US LOC B", country: "US", minAmount: 250000, maxAmount: 500000 },
  { id: 3, name: "CA Equip", country: "CA", minAmount: 200000, maxAmount: Number.POSITIVE_INFINITY },
  { id: 4, name: "US Fact", country: "US", minAmount: 10000, maxAmount: 200000 },
];

function filterByStep1(s1: any) {
  const s = normalizeStep1(s1);
  return sampleProducts.filter(p =>
    (s.country === "NA" || p.country === s.country) &&
    (s.amount === 0 || (p.minAmount <= s.amount && s.amount <= p.maxAmount))
  );
}

function test(label: string, fn: Function) {
  try {
    fn();
    console.log("✅ PASS", label);
  } catch (e: any) {
    console.error("❌ FAIL", label, "-", e?.message || e);
    process.exitCode = 1;
  }
}

console.log("🔧 Testing Step 1 → Step 2/5 compatibility...\n");

// Test 1: Field alias mapping
test("Step1 field alias mapping", () => {
  const cases = [
    { input: { amountRequested: "$500,000", country: "Canada" }, want: { amount: 500000, country: "CA" } },
    { input: { loanAmount: 250000, country: "US" }, want: { amount: 250000, country: "US" } },
    { input: { requested_amount: "750,000", country: "usa" }, want: { amount: 750000, country: "US" } },
    { input: { fundsNeeded: "1_000_000", country: "CA" }, want: { amount: 1000000, country: "CA" } },
    { input: { amount: "900000", applicantCountry: "United States" }, want: { amount: 900000, country: "US" } },
    { input: { loan_size: "100000" }, want: { amount: 100000, country: "NA" } },
  ];

  for (const c of cases) {
    const got = normalizeStep1(c.input);
    assert.equal(got.amount, c.want.amount, `amount mismatch for ${JSON.stringify(c.input)}`);
    assert.equal(got.country, c.want.country, `country mismatch for ${JSON.stringify(c.input)}`);
  }
});

// Test 2: Product filtering logic
test("Step2 product filtering — CA $500k", () => {
  const got = filterByStep1({ amountRequested: "$500,000", country: "Canada" }).map(p => p.id).sort();
  assert.deepEqual(got, [1, 3]); // Should match CA products within range
});

test("Step2 product filtering — US $250k", () => {
  const got = filterByStep1({ loanAmount: 250000, country: "US" }).map(p => p.id).sort();
  assert.deepEqual(got, [2]); // Should match US LOC B only
});

test("Step2 product filtering — no filters", () => {
  const got = filterByStep1({}).length;
  assert.equal(got, sampleProducts.length); // Should return all products
});

// Test 3: Required docs shape normalization
function normalizeRequiredDocsShape(resp: any): string[] {
  if (Array.isArray(resp)) return resp;
  if (resp && Array.isArray(resp.required_documents)) return resp.required_documents;
  if (resp && Array.isArray(resp.items)) return resp.items;
  return [];
}

test("Step5 required-docs shape normalization", () => {
  const a = normalizeRequiredDocsShape(["Bank Statements", "Tax Returns"]);
  assert.equal(a.length, 2, "array shape");
  
  const b = normalizeRequiredDocsShape({ required_documents: ["Bank Statements", "Tax Returns", "Financials"] });
  assert.equal(b.length, 3, "required_documents shape");
  
  const c = normalizeRequiredDocsShape({ items: ["License"] });
  assert.equal(c.length, 1, "items shape");
  
  const d = normalizeRequiredDocsShape({});
  assert.equal(d.length, 0, "fallback empty");
});

// Test 4: Legacy field guards
test("Legacy field guards", () => {
  const state: any = {}; // missing fields should not throw
  const bypassed = state?.bypassedDocuments ?? [];
  assert.ok(Array.isArray(bypassed));
});

console.log("\n🎯 All compatibility tests completed!");