type PreApplicationLookupResponse = {
  token: string;
  companyName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  annualRevenue?: string;
  requestedAmount?: string | number;
  yearsInBusiness?: string;
};

export async function lookupPreApplication(
  email: string
): Promise<PreApplicationLookupResponse | null> {
  const res = await fetch(
    `/api/preapp/lookup?email=${encodeURIComponent(email)}`,
    { credentials: "include" }
  );

  if (!res.ok) return null;
  return res.json();
}

export async function consumePreApplication(token: string) {
  const res = await fetch("/api/preapp/consume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    throw new Error("Failed to consume pre-application");
  }

  return res.json();
}
