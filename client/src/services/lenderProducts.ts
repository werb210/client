export async function fetchLenderProducts(applicationId: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE}/lender-products?applicationId=${applicationId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_CLIENT_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch lender products");
  }

  return response.json();
}