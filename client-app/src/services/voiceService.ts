import { Device, Call } from "@twilio/voice-sdk";

let device: Device | null = null;
let activeCall: Call | null = null;
let tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let registerInFlight: Promise<void> | null = null;
let currentClientId: string | null = null;

export type CallState =
  | "idle"
  | "connecting"
  | "connected"
  | "ended"
  | "error";

let currentState: CallState = "idle";
const listeners = new Set<(state: CallState) => void>();

function notify(state: CallState) {
  currentState = state;
  listeners.forEach((fn) => fn(state));
}

export function subscribeToCallState(fn: (state: CallState) => void) {
  listeners.add(fn);
  fn(currentState);
  return () => {
    listeners.delete(fn);
  };
}

async function fetchToken(clientId: string) {
  const res = await fetch("/api/voice/token", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId }),
  });

  if (!res.ok) {
    throw new Error("Token fetch failed");
  }

  return res.json() as Promise<{ token: string }>;
}

async function ensureRegistered() {
  if (!device) return;
  if (registerInFlight) {
    await registerInFlight;
    return;
  }

  registerInFlight = device.register();
  try {
    await registerInFlight;
  } finally {
    registerInFlight = null;
  }
}

async function refreshToken() {
  if (!currentClientId || !device) return;
  const { token } = await fetchToken(currentClientId);
  device.updateToken(token);
}

function scheduleTokenRefresh() {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
  }

  tokenRefreshTimer = setTimeout(async () => {
    try {
      await refreshToken();
      await ensureRegistered();
      scheduleTokenRefresh();
    } catch {
      notify("error");
    }
  }, 50 * 60 * 1000);
}

export async function initClientVoice(clientId: string) {
  try {
    currentClientId = clientId;
    const { token } = await fetchToken(clientId);

    if (device) {
      await destroyClientVoice();
    }

    device = new Device(token, { logLevel: 1 });

    device.on("error", () => notify("error"));
    device.on("disconnect", () => {
      activeCall = null;
      notify("ended");
    });
    device.on("unregistered", () => {
      void ensureRegistered().catch(() => notify("error"));
    });
    device.on("tokenWillExpire", () => {
      void refreshToken().catch(() => notify("error"));
    });

    await ensureRegistered();
    notify("idle");
    scheduleTokenRefresh();
  } catch {
    notify("error");
  }
}

async function ensureAudioPermission() {
  if (typeof window === "undefined") return;
  if (!window.isSecureContext) {
    throw new Error("Voice requires HTTPS.");
  }

  const mediaDevices = navigator?.mediaDevices;
  if (!mediaDevices?.getUserMedia) {
    return;
  }

  const stream = await mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
}

export async function callBF() {
  if (!device) return null;
  if (activeCall) return activeCall;

  notify("connecting");

  try {
    await ensureRegistered();
    await ensureAudioPermission();

    activeCall = await device.connect({});

    activeCall.on("accept", () => notify("connected"));
    activeCall.on("disconnect", () => {
      activeCall = null;
      notify("ended");
    });
    activeCall.on("cancel", () => {
      activeCall = null;
      notify("ended");
    });
    activeCall.on("reject", () => {
      activeCall = null;
      notify("ended");
    });

    return activeCall;
  } catch {
    activeCall = null;
    notify("error");
    return null;
  }
}

export function endCall() {
  activeCall?.disconnect();
  activeCall = null;
}

export async function destroyClientVoice() {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }

  endCall();

  await device?.destroy();
  device = null;
  currentClientId = null;
  notify("idle");
}
