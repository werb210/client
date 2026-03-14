export async function safeFetch<T = Record<string, never>>(
  url: string,
  options?: RequestInit,
): Promise<T | Record<string, never>> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      return {};
    }

    const text = await response.text();

    if (!text.trim()) {
      return {};
    }

    return JSON.parse(text) as T;
  } catch {
    return {};
  }
}
