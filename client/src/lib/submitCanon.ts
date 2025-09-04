export async function submitCanon(fullCanon: any) {
  const traceId = (crypto as any)?.randomUUID?.() || `${Date.now()}-trace`;
  const body = {
    ...fullCanon,                      // legacy compat if server still accepts flat
    application_canon: fullCanon,      // ← canonical
    application_canon_version: 'v1'
  };
  const res = await fetch(`${import.meta.env.VITE_STAFF_API_BASE}/v1/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Trace-Id': traceId,
      'X-App-Schema': 'ApplicationV1',
      'X-App-Version': 'v1.0.0'
    },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('submit failed');
  return { traceId, json: await res.json() };
}