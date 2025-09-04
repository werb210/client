import { v4 as uuidv4 } from 'uuid';

export async function submitCanon(canon: Record<string, any>, base: string) {
  const version = 'v1';
  const traceId = uuidv4();
  const payload = {
    ...canon,                                   // legacy-compat if server still reads flat keys
    application_canon: JSON.stringify(canon),   // canonical JSON
    application_canon_version: version,
  };
  
  const res = await fetch(`${base}/api/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Trace-Id': traceId,
      'X-App-Schema': 'ApplicationV1',
      'X-App-Version': 'v1.0.0',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) throw new Error(`Submit failed ${res.status}`);
  return { traceId, json: await res.json() };
}