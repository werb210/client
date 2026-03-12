import { Device } from "@twilio/voice-sdk";
import { API_BASE } from "../../config/api";

let device: Device | null = null;

export async function initializeVoice(identity: string) {
  const res = await fetch(
    `${API_BASE}/api/voice/token?identity=${encodeURIComponent(identity)}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch voice token: ${res.status}`);
  }

  const { token } = await res.json();

  device = new Device(token, {
    codecPreferences: ["opus", "pcmu"],
    closeProtection: true,
  } as any);

  device.register();
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
