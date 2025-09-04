/** Run in a browser context or adapt to load saved canon JSON. */
const schemaText = `/* paste shared/schema.ts here or load via fetch in dev */`;
const formKeys = Array.from(new Set((schemaText.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g) || []).map(s => s.replace(/[:\s]/g,''))));
const canon = JSON.parse(localStorage.getItem('bf:canon:v1')||'{}');
const submitKeys = Object.keys(canon);
const missing = formKeys.filter(k => !submitKeys.includes(k));
console.log(`form keys: ${formKeys.length} submit keys: ${submitKeys.length}`);
console.log(`missing in submit: ${missing.length}`, missing);