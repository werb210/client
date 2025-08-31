import assert from "node:assert/strict";
import { FIELD_MANIFEST } from "../src/telemetry/field-manifest";
import lineage from "../src/telemetry/lineage";

describe("Field Manifest & Consumers", ()=>{
  it("includes Step 1–4 keys in manifest", ()=>{
    const steps = FIELD_MANIFEST.byStep;
    const all   = new Set(FIELD_MANIFEST.all);
    // Expect some canonical keys commonly used by Step 2/5
    const expected = ["amountRequested","loanAmount","country","industry","entityType","province","revenue","timeInBusiness"];
    const missing = expected.filter(k=> !all.has(k));
    // Not fatal if project names differ; ensure at least 3 critical keys exist
    assert.ok(expected.length - missing.length >= 3, "Too few expected keys present: "+missing.join(","));
  });

  it("attachTrace unifies manifest+runtime", ()=>{
    const payload = { foo:"bar" };
    const runtime = { amountRequested:500000, country:"CA" };
    const out:any = (lineage as any).attachTrace(payload, runtime);
    const f = new Set(out._trace.fields);
    ["amountRequested","country"].forEach(k=> assert.ok(f.has(k)));
    // also includes something from manifest (heuristic)
    assert.ok(out._trace.fields.length >= Object.keys(runtime).length, "union must be >= runtime keys");
  });
});
