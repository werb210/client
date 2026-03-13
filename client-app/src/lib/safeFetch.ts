export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.warn("API returned error:", res.status, url);
      return null;
    }
    return await res.json();
  } catch {
    console.warn("API failure:", url);
    return null;
  }
}
