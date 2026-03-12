export async function fetchVoiceToken(_identity?: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.staff.boreal.financial/api/voice/token", {
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
    console.warn("Voice token error:", err);
    return null;
  }
}
