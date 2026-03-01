import { Device, Call } from "@twilio/voice-sdk";
import { apiRequest } from "@/services/api";

let device: Device | null = null;
let activeCall: Call | null = null;
let activeConnection: Call | null = null;
let refreshTimer: number | null = null;
let initializing = false;
let onlineListenerAttached = false;

export type CallState = "idle" | "connecting" | "connected" | "ended" | "error";

let state: CallState = "idle";
const listeners = new Set<(s: CallState) => void>();

function setState(s: CallState) {
  state = s;
  listeners.forEach((fn) => fn(s));
}

export function subscribe(fn: (s: CallState) => void) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

async function fetchToken(): Promise<{ token: string }> {
  return apiRequest<{ token: string }>("/api/voice/token", {
    method: "POST",
  });
}

function handleOnline() {
  if (!device) {
    void initVoice();
  }
}

function ensureOnlineRecoveryListener() {
  if (onlineListenerAttached || typeof window === "undefined") return;

  window.addEventListener("online", handleOnline);
  onlineListenerAttached = true;
}

export async function initVoice() {
  if (device || initializing) return;

  if (
    typeof window !== "undefined" &&
    window.location.protocol !== "https:" &&
    window.location.hostname !== "localhost"
  ) {
    if (import.meta.env.DEV) {
      console.warn("Voice requires HTTPS");
    }
    return;
  }

  initializing = true;

  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });

    const { token } = await fetchToken();

    device = new Device(token, { logLevel: 1 });

    device.on("registered", () => {
      initializing = false;
      setState("idle");
    });

    device.on("error", () => {
      initializing = false;
      setState("error");
    });

    device.on("incoming", (call) => {
      if (activeCall) {
        call.reject();
        return;
      }
      activeCall = call;
      activeConnection = call;

      call.on("accept", () => {
        setState("connected");
      });

      call.on("disconnect", () => {
        activeCall = null;
        activeConnection = null;
        setState("ended");
      });

      call.on("error", () => {
        activeCall = null;
        activeConnection = null;
        setState("error");
      });

      call.accept();
    });

    await device.register();
    ensureOnlineRecoveryListener();
    scheduleRefresh();
  } catch {
    setState("error");
    initializing = false;
  }
}

function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);

  refreshTimer = window.setTimeout(async () => {
    if (!device) return;

    try {
      const { token } = await fetchToken();
      device.updateToken(token);
      scheduleRefresh();
    } catch {
      setState("error");
    }
  }, 50 * 60 * 1000);
}

export async function startCall() {
  if (!device || activeConnection) return;

  setState("connecting");

  try {
    activeConnection = await device.connect({});
    activeCall = activeConnection;

    activeConnection.on("accept", () => {
      setState("connected");
    });

    activeConnection.on("disconnect", () => {
      activeCall = null;
      activeConnection = null;
      setState("ended");
    });

    activeConnection.on("error", () => {
      activeCall = null;
      activeConnection = null;
      setState("error");
    });
  } catch {
    activeCall = null;
    activeConnection = null;
    setState("error");
  }
}

export function endCall() {
  if (activeConnection) {
    activeConnection.disconnect();
    activeConnection = null;
  }
  activeCall = null;
}

export function destroyVoice() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (activeCall) {
    activeCall.disconnect();
    activeCall = null;
  }
  activeConnection = null;

  if (device) {
    device.destroy();
    device = null;
  }

  if (onlineListenerAttached && typeof window !== "undefined") {
    window.removeEventListener("online", handleOnline);
    onlineListenerAttached = false;
  }

  initializing = false;
  setState("idle");
}
