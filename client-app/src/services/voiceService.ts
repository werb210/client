import { Call, Device } from "@twilio/voice-sdk";
import { apiRequest } from "./api";

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
  const data = await apiRequest<{ token: string }>("/api/telephony/token", {
    method: "POST",
    body: JSON.stringify({ identity }),
  });

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
