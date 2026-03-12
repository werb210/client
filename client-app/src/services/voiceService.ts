import { Call, Device } from "@twilio/voice-sdk";
import { apiUrl } from "@/config/api";

let device: Device | null = null;
let activeCall: Call | null = null;

export type CallState = "idle" | "connecting" | "connected" | "ended" | "error";

let state: CallState = "idle";
const listeners = new Set<(nextState: CallState) => void>();

function notify(nextState: CallState) {
  state = nextState;
  listeners.forEach((listener) => listener(nextState));
}

export function subscribe(listener: (nextState: CallState) => void) {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export async function initVoice(identity: string) {
  try {
    const response = await fetch(
      apiUrl(`/api/voice/token?identity=${encodeURIComponent(identity)}`),
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      console.warn("Voice token request failed:", response.status);
      return null;
    }

    const data = (await response.json()) as { token?: string };

    if (!data.token) {
      return null;
    }

    device = new Device(data.token);

    device.on("incoming", (call) => {
      activeCall = call;

      call.on("accept", () => notify("connected"));
      call.on("disconnect", () => {
        activeCall = null;
        notify("ended");
      });
      call.on("error", () => {
        activeCall = null;
        notify("error");
      });

      call.accept();
    });

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

export async function callNumber(number: string) {
  if (!device) throw new Error("Voice device not initialized");

  notify("connecting");
  const call = await device.connect({
    params: { to: number },
  });

  activeCall = call;

  call.on("accept", () => notify("connected"));
  call.on("disconnect", () => {
    activeCall = null;
    notify("ended");
  });
  call.on("error", () => {
    activeCall = null;
    notify("error");
  });

  return call;
}

export async function startCall(number: string) {
  return callNumber(number);
}

export function endCall() {
  if (activeCall) {
    activeCall.disconnect();
    activeCall = null;
  }

  notify("ended");
}

export function destroyVoice() {
  endCall();
  if (device) {
    device.destroy();
    device = null;
  }
  notify("idle");
}
