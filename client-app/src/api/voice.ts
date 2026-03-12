import { apiUrl } from "@/config/api";

export async function getVoiceToken(identity?: string): Promise<string | null> {
  try {
    const query = identity
      ? `?identity=${encodeURIComponent(identity)}`
      : "";
    const res = await fetch(apiUrl(`/api/voice/token${query}`), {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      console.warn("Voice token request failed:", res.status);
      return null;
    }

    const data = await res.json();

    return data?.token || null;
  } catch (err) {
    console.warn("Voice token fetch error:", err);
    return null;
  }
}

export async function fetchVoiceToken(identity?: string): Promise<string | null> {
  return getVoiceToken(identity);
}
