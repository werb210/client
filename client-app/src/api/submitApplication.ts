export default async function submitApplication(payload: any) {
  return fetch(`${process.env.NEXT_PUBLIC_STAFF_SERVER_URL}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
