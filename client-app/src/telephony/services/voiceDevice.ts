import { Device } from "@twilio/voice-sdk";
import { apiUrl } from "../../config/api";

let device: Device | null = null;

export async function initializeVoice(identity: string) {
  try {
    const res = await fetch(
      apiUrl(`/api/voice/token?identity=${encodeURIComponent(identity)}`),
      {
        credentials: "include",
      }
    );

    if (!res.ok) {
      console.warn(`Failed to fetch voice token: ${res.status}`);
      return null;
    }

    const { token } = await res.json();

    device = new Device(token, {
      codecPreferences: ["opus", "pcmu"],
      closeProtection: true,
    } as any);

    await device.register();
    return device;
  } catch (error) {
    console.warn("Voice initialization failed:", error);
    return null;
  }
}

export function getDevice() {
  return device;
}

export async function startCall(destination: string) {
  if (!device) {
    throw new Error("Voice device not initialized");
  }

  const call = await device.connect({
    params: { to: destination },
  });

  return call;
}
