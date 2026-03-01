import { Device, Call } from "@twilio/voice-sdk";

let device: Device | null = null;
let activeCall: Call | null = null;

export async function initClientVoice(clientId: string) {
  const res = await fetch("/api/voice/token", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId }),
  });

  const { token } = await res.json();

  device = new Device(token, { logLevel: 1 });
  await device.register();
}

export async function callBF() {
  if (!device) return null;

  activeCall = await device.connect({
    params: {},
  });

  activeCall.on("disconnect", () => {
    activeCall = null;
  });

  return activeCall;
}
