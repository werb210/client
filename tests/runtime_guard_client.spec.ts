import { test, expect } from "@playwright/test";
const START = process.env.CLIENT_URL || "http://localhost:5000/";
const SLOW_MS = 1500;

test("no console errors; no 4xx/5xx; no slow calls", async ({ page }) => {
  const errors:string[]=[]; page.on("console",m=>{ if(m.type()==="error") errors.push(m.text()); });
  const bad:string[]=[]; page.on("response",async r=>{ if(r.status()>=400) bad.push(`${r.status()} ${r.url()}`); });

  await page.goto(START); await page.waitForLoadState("networkidle");

  const perf = await page.evaluate(()=>performance.getEntriesByType("resource")
    .filter((e:any)=>e.initiatorType==="fetch"||e.initiatorType==="xmlhttprequest")
    .map((e:any)=>({name:e.name,dur:e.duration})));
  const slow = perf.filter((p:any)=>p.dur>SLOW_MS).map((p:any)=>`${Math.round(p.dur)}ms ${p.name}`);

  expect(errors,"Console errors").toHaveLength(0);
  expect(bad,"Broken network calls").toHaveLength(0);
  expect(slow,"Slow API calls >1.5s").toHaveLength(0);
});