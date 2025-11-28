export async function portalGet(endpoint: string, token: string) {
  const resp = await fetch(
    `${import.meta.env.VITE_STAFF_SERVER}/api/client-portal/${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!resp.ok) throw new Error("Request failed");
  return resp.json();
}

export async function portalPost(
  endpoint: string,
  token: string,
  data: unknown
) {
  const resp = await fetch(
    `${import.meta.env.VITE_STAFF_SERVER}/api/client-portal/${endpoint}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );

  if (!resp.ok) throw new Error("Request failed");
  return resp.json();
}
