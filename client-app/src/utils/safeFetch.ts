export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      return {};
    }

    const text = await response.text();

    if (!text) {
      return {};
    }

    return JSON.parse(text);
  } catch {
    return {};
  }
}
