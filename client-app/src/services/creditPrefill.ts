export async function fetchCreditPrefill(id: string) {
  const res = await fetch(`/api/credit-readiness/${id}`);
  if (!res.ok) {
    throw new Error("Unable to fetch prefill data");
  }
  return res.json();
}

