import { Device } from "@twilio/voice-sdk";
import { getVoiceToken } from "@/api/voice";

let device: Device | null = null;

export async function initializeVoice() {
  try {
    const token = await getVoiceToken();

    if (!token) {
      console.warn("Twilio disabled: no token available");
      return null;
    }

    device = new Device(token, {
      logLevel: 1,
    });

    device.on("registered", () => {
      console.log("Twilio device registered");
    });

    device.on(
      "error",
      ((err: unknown) => {
        console.warn("Twilio device error:", err);
      }) as () => void
    );

    await device.register();

    return device;
  } catch (err) {
    console.warn("Voice initialization failed:", err);
    return null;
  }
}

export function getVoiceDevice() {
  return device;
}
