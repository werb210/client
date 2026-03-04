import { Device, Call } from "@twilio/voice-sdk";

let device: Device | null = null;
let activeCall: Call | null = null;

export async function initializeClientVoice(token: string) {
  device = new Device(token);

  device.on("registered", () => {
    console.log("Client voice device registered");
  });

  device.on("incoming", (call: Call) => {
    console.log("Incoming call from staff");

    activeCall = call;

    call.on("disconnect", () => {
      activeCall = null;
    });

    call.accept();
  });

  device.on("error", (...args: unknown[]) => {
    console.error("Twilio device error:", args[0]);
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
