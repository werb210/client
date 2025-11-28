export async function fetchProductCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load categories");
  }

  return res.json();
}
