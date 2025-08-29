// Node 18+ (global fetch). Validates shape from Staff API.
const BASE = process.env.VITE_STAFF_API_URL || 'https://staff.boreal.financial/api';
const TOK  = process.env.VITE_CLIENT_APP_SHARED_TOKEN || '';

const required = ['id','lender_id','name','country','amount_min','amount_max','active'];

(async () => {
  const res = await fetch(`${BASE}/v1/products`, { headers: { Authorization: `Bearer ${TOK}` }});
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('Expected array');

  const bad = [];
  for (const [i,p] of data.entries()) {
    const missing = required.filter(k => !(k in p));
    if (missing.length) bad.push({ index:i, id:p?.id, missing });
  }

  console.log(JSON.stringify({
    ok: bad.length === 0,
    count: data.length,
    sample: data.slice(0,3),
    missingSummary: bad.slice(0,5),
  }, null, 2));

  if (bad.length) process.exit(2);
})();