import { Device } from "@twilio/voice-sdk";

let device: Device | null = null;

export async function initializeClientVoice(token: string) {
  device = new Device(token);

  await device.register();
}

export async function startClientCall() {
  if (!device) throw new Error("Voice device not initialized");

  await device.connect({
    params: {
      To: "staff",
    },
  });
}
