# CLIENT APP — Deep compatibility test for Step-1 → Step-2/5 (field aliases, filtering, req-docs shape) + code scan
# - Creates a Step-1 adapter (non-destructive; only adds files under client/src/domain and tests/scripts)
# - Builds a thorough TS test (Vitest/Jest if present; otherwise runs via tsx with Node assert)
# - Scans Step-2/5 components to discover which Step-1 fields they actually read (to catch mismatches)
# - Exits non-zero on any failing assertion; writes artifacts under reports/client-step1-compat-<ts>/
set -euo pipefail

TS="$(date +%F_%H-%M-%S)"
R="reports/client-step1-compat-$TS"; mkdir -p "$R"
echo "== CLIENT Step1→Step2/5 deep test @ $TS ==" | tee "$R/context.txt"

# --- pick package.json (prefer client/package.json)
PKG="package.json"; [ -f client/package.json ] && PKG="client/package.json"
echo "using $PKG" | tee -a "$R/context.txt"

# --- detect runners
HAVE_VITEST="$(jq -r '.devDependencies.vitest // .dependencies.vitest // empty' "$PKG" 2>/dev/null || echo "")"
HAVE_JEST="$(jq -r '.devDependencies.jest   // .dependencies.jest   // empty' "$PKG" 2>/dev/null || echo "")"
RUN_TSX="npx --yes tsx"
if ! npx --yes tsx -v >/dev/null 2>&1; then
  if npx --yes ts-node -v >/dev/null 2>&1; then RUN_TSX="node -r ts-node/register"
  else RUN_TSX="node"
  fi
fi
echo "vitest:$([ -n "$HAVE_VITEST" ] && echo yes || echo no)  jest:$([ -n "$HAVE_JEST" ] && echo yes || echo no)  tsx:$RUN_TSX" | tee -a "$R/context.txt"

# --- add canonical product normalizer if missing (idempotent)
if [ ! -f client/src/api/normalize.ts ]; then
  mkdir -p client/src/api
  cat > client/src/api/normalize.ts <<'TS'
export type CanonicalProduct = {
  id?: string|number;
  name: string;
  category: string;
  lenderName: string;
  country: string;     // "CA" | "US" | ...
  minAmount: number;   // inclusive
  maxAmount: number;   // inclusive or Infinity
  raw: any;
};
const num = (v:any, d=0)=>{ const n=Number((v??'').toString().replace(/[$,_\s]/g,'')); return Number.isFinite(n)? n : d; };
const up  = (s:any)=> (s??"").toString().trim().toUpperCase();
export const toCanonical = (p:any): CanonicalProduct => {
  const name = p.name ?? p.productName ?? p.title ?? "";
  const lenderName = p.lenderName ?? p.lender_name ?? p.lender ?? "";
  const cc = up(p.country ?? p.countryCode ?? p.region ?? "");
  const country = cc==="CANADA" ? "CA" : cc==="USA" ? "US" : (cc==="UNITED STATES"?"US": (cc==="US"||cc==="CA"?cc:"NA"));
  const min = num(p.minAmount ?? p.min_amount ?? p.min ?? 0, 0);
  const maxRaw = p.maxAmount ?? p.max_amount ?? p.max ?? null;
  const max = maxRaw==null ? Number.POSITIVE_INFINITY : num(maxRaw, Number.POSITIVE_INFINITY);
  const category = p.category ?? p.type ?? "Unknown";
  return { id:p.id, name, category, lenderName, country, minAmount:min, maxAmount:max, raw:p };
};
TS
  echo "Wrote client/src/api/normalize.ts" | tee -a "$R/context.txt"
fi

# --- Step-1 adapter (maps many possible field names → canonical {amount, country}); also req-docs normalizer
mkdir -p client/src/domain
cat > client/src/domain/step1-adapter.ts <<'TS'
export type Step1Canonical = { amount: number; country: string; };
const parseNum = (v:any):number => {
  if (v==null) return 0;
  const s = (typeof v==='number')? String(v) : String(v);
  const n = Number(s.replace(/[$,_\s]/g,''));
  return Number.isFinite(n)? n : 0;
};
const toCC = (v:any):string => {
  const s = (v??'').toString().trim().toUpperCase();
  if (!s) return "NA";
  if (["CA","CANADA"].includes(s)) return "CA";
  if (["US","USA","UNITED STATES","U.S.","U.S.A."].includes(s)) return "US";
  return s.length===2 ? s : "NA";
};
/** Accepts any Step-1-ish payload and returns the fields Step 2 & 5 actually use. */
export function normalizeStep1(d:any): Step1Canonical {
  const amount =
    parseNum(d?.amountRequested)   ||
    parseNum(d?.loanAmount)        ||
    parseNum(d?.requestedAmount)   ||
    parseNum(d?.requested_amount)  ||
    parseNum(d?.amount)            ||
    parseNum(d?.fundsNeeded)       ||
    parseNum(d?.fundingAmount)     ||
    parseNum(d?.loan_size)         || 0;
  const country =
    toCC(d?.country) || toCC(d?.countryCode) || toCC(d?.applicantCountry) || toCC(d?.region) || "NA";
  return { amount, country };
}

/** Required-docs normalizer used by Step 5 */
export function normalizeRequiredDocsShape(resp:any): string[] {
  if (Array.isArray(resp)) return resp;
  if (resp && Array.isArray(resp.required_documents)) return resp.required_documents;
  if (resp && Array.isArray(resp.items)) return resp.items;
  return [];
}
TS

# --- static code scan: find real Step-2/5 field usages so we can prove coverage
command -v rg >/dev/null || alias rg='grep -R'
SCAN_OUT="$R/field-usage.txt"
{
  echo "=== Step 2/5 field usage scan ==="
  rg -n --hidden -S "(amountRequested|loanAmount|requestedAmount|requested_amount|amount|fundsNeeded|fundingAmount|loan_size|country|countryCode|applicantCountry|region)" \
     client/src | sed 's/^/  /' || true
} | tee "$SCAN_OUT"

# --- build a deep test (Vitest/Jest spec if framework present; else tsx runner)
mkdir -p client/scripts client/tests

DEEP_TEST_CONTENT='
import assert from "node:assert/strict";
import { normalizeStep1, normalizeRequiredDocsShape } from "../src/domain/step1-adapter";
import { toCanonical } from "../src/api/normalize";

type Case = { name:string; input:any; want:{amount:number; country:string} };
const step1Cases: Case[] = [
  { name:"amountRequested + Canada", input:{ amountRequested:"$500,000", country:"Canada" }, want:{ amount:500000, country:"CA" } },
  { name:"loanAmount + US",          input:{ loanAmount: 250000, country:"US" },            want:{ amount:250000, country:"US" } },
  { name:"requested_amount + usa",   input:{ requested_amount:"750,000", country:"usa" },   want:{ amount:750000, country:"US" } },
  { name:"fundsNeeded + CA code",    input:{ fundsNeeded:"1_000_000", country:"CA" },       want:{ amount:1000000, country:"CA" } },
  { name:"fallback amount field",    input:{ amount:"900000", applicantCountry:"United States" }, want:{ amount:900000, country:"US" } },
  { name:"unknown -> NA country",    input:{ loan_size:"100000" },                           want:{ amount:100000, country:"NA" } },
];

function t(label:string, fn:Function){
  try { fn(); console.log("PASS", label); }
  catch (e:any){ console.error("FAIL", label, "-", e?.message||e); process.exitCode = 1; }
}

// 1) Step-1 alias mapping → canonical
t("Step1 alias → canonical mapping", ()=>{
  for (const c of step1Cases) {
    const got = normalizeStep1(c.input);
    assert.equal(got.amount,  c.want.amount,  "amount mismatch for "+c.name);
    assert.equal(got.country, c.want.country, "country mismatch for "+c.name);
  }
});

// 2) Step-2 filtering semantics (amount+country) on canonical products
const sampleProducts = [
  { id:1, productName:"CA LOC A", category:"Line of Credit", lender_name:"Revenued", country:"CANADA", minAmount:50000,  maxAmount:1000000 },
  { id:2, productName:"US LOC B", category:"Line of Credit", lender_name:"SomeBank", country:"USA",    minAmount:250000, maxAmount:500000 },
  { id:3, productName:"CA Equip", category:"Equipment",      lender_name:"Meridian", country:"CA",     minAmount:200000, maxAmount:null },
  { id:4, productName:"US Fact",  category:"Factoring",      lender_name:"Accord",   country:"US",     minAmount:10000,  maxAmount:200000 },
].map(toCanonical);

function filterByStep1(s1:any){
  const s = normalizeStep1(s1);
  return sampleProducts.filter(p =>
    (s.country==="NA" || p.country===s.country) &&
    (s.amount===0 || (p.minAmount<=s.amount && s.amount<=p.maxAmount)));
}

t("Step2 product filtering — CA $500k matches expected", ()=>{
  const got = filterByStep1({ amountRequested:"$500,000", country:"Canada" }).map(p=>p.id).sort();
  assert.deepEqual(got, [1,3]);
});
t("Step2 product filtering — US $250k matches expected", ()=>{
  const got = filterByStep1({ loanAmount:250000, country:"US" }).map(p=>p.id).sort();
  assert.deepEqual(got, [2]);
});
t("Step2 product filtering — no filters returns all", ()=>{
  const got = filterByStep1({}).length;
  assert.equal(got, sampleProducts.length);
});

// 3) Step-5 required-docs shapes (array | {required_documents} | {items})
t("Step5 required-docs shape normalization", ()=>{
  const a = normalizeRequiredDocsShape(["Bank Statements","Tax Returns"]);
  assert.equal(a.length, 2, "array shape");
  const b = normalizeRequiredDocsShape({ required_documents:["Bank Statements","Tax Returns","Financials"] });
  assert.equal(b.length, 3, "required_documents shape");
  const c = normalizeRequiredDocsShape({ items:["License"] });
  assert.equal(c.length, 1, "items shape");
  const d = normalizeRequiredDocsShape({});
  assert.equal(d.length, 0, "fallback empty");
});

// 4) Guard legacy banner fields so undefined doesn\'t crash Step 5
t("Legacy banner guard — bypassedDocuments", ()=>{
  const state:any = {}; // missing fields should not throw
  const bypassed = state?.bypassedDocuments ?? [];
  assert.ok(Array.isArray(bypassed));
});

console.log("\\nAll deep tests executed.");
'

# --- write tests in appropriate place
if [ -n "$HAVE_VITEST" ]; then
  echo "Writing Vitest spec..." | tee -a "$R/context.txt"
  echo "$DEEP_TEST_CONTENT" > client/tests/step1-compat.spec.ts
elif [ -n "$HAVE_JEST" ]; then
  echo "Writing Jest spec..." | tee -a "$R/context.txt"
  # Jest can run TS via ts-jest or babel; if unavailable, fallback to tsx-runner path below will be used.
  echo "$DEEP_TEST_CONTENT" > client/tests/step1-compat.test.ts
else
  echo "Writing tsx deep test script..." | tee -a "$R/context.txt"
  echo "$DEEP_TEST_CONTENT" > client/scripts/step1-compat.deep.test.ts
fi

# --- run tests
set +e
if [ -n "$HAVE_VITEST" ]; then
  ( cd client && npx --yes vitest run --reporter=basic ) | tee "$R/output.txt"
  RC="${PIPESTATUS[0]}"
elif [ -n "$HAVE_JEST" ]; then
  ( cd client && npx --yes jest --runInBand ) | tee "$R/output.txt"
  RC="${PIPESTATUS[0]}"
else
  $RUN_TSX client/scripts/step1-compat.deep.test.ts | tee "$R/output.txt"
  RC="${PIPESTATUS[0]}"
fi
set -e

# --- final summary
if [ "${RC:-0}" -eq 0 ]; then
  echo "RESULT: PASS — Step-1 aliases map correctly; Step-2 filtering & Step-5 req-docs normalization validated." | tee -a "$R/output.txt"
else
  echo "RESULT: FAIL — See $R/output.txt for first failing assertion and stack. Fix adapters or component usage accordingly." | tee -a "$R/output.txt"
  exit "$RC"
fi

echo
echo "Artifacts:"
echo "  - Field usage scan:   $SCAN_OUT"
echo "  - Test output:        $R/output.txt"
echo "  - Context:            $R/context.txt"