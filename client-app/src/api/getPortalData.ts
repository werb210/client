const STAFF_SERVER_URL =
  import.meta.env.VITE_STAFF_SERVER_URL || process.env.NEXT_PUBLIC_STAFF_SERVER_URL;

export default async function getPortalData(email: string, token: string) {
  if (!STAFF_SERVER_URL) throw new Error("Staff server URL not configured");

  const r = await fetch(`${STAFF_SERVER_URL}/api/client/portal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token })
  });

  if (!r.ok) throw new Error("Portal fetch failed");
  return r.json();
}
