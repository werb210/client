import assert from "node:assert/strict";
import { flatten, attachTrace } from "../src/telemetry/lineage";
const sampleS1 = { amountRequested: "$500,000", country: "Canada", industry: "SaaS" };
const payload = { applicant:{name:"Acme"}, answers:{loanAmount:500000, country:"CA"} };
const withTrace = attachTrace(payload, sampleS1);
it("attaches _trace.id and fields[]", ()=>{
  assert.ok(withTrace._trace?.id);
  assert.ok(Array.isArray(withTrace._trace.fields));
  assert.ok(withTrace._trace.fields.includes("amountRequested"));
});
it("flatten traverses all keys", ()=>{
  const f = flatten({a:{b:1}, c:[{d:2}]});
  assert.equal(f["a.b"],1);
  assert.equal(f["c.0.d"],2);
});
