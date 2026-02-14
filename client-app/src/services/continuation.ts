export async function fetchContinuation(token: string) {
  const res = await fetch(`/api/client/continuation/${token}`);
  if (!res.ok) return null;
  return res.json();
}
