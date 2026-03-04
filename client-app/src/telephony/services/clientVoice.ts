import { Device, Call } from "@twilio/voice-sdk";

let device: Device | null = null;
let activeCall: Call | null = null;

export async function initializeClientVoice(token: string) {
  device = new Device(token);

  device.on("registered", () => {
    /* device ready */
  });

  device.on("incoming", (call: Call) => {
    activeCall = call;

    call.on("disconnect", () => {
      activeCall = null;
    });

    call.accept();
  });

  device.on("error", () => {
    /* device error handled upstream */
  });

  await device.register();
}

export async function startClientCall() {
  if (!device) {
    throw new Error("Voice device not initialized");
  }

  activeCall = await device.connect({
    params: {
      To: "staff"
    }
  });
}

export function hangupClientCall() {
  if (activeCall) {
    activeCall.disconnect();
    activeCall = null;
  }
}
