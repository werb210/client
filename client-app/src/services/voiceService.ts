let device: any = null;
let currentCall: any = null;
let tokenRefreshTimer: any = null;

export type CallState = "idle" | "connecting" | "connected" | "ended" | "error";

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

export async function initVoice(token: string) {
  if (device) {
    destroyClientVoice();
  }

  device = new (window as any).Twilio.Device(token, {
    logLevel: 1,
  });

  device.on("error", () => {
    notify("error");
  });

  device.on("tokenWillExpire", async () => {
    await refreshToken();
  });

  device.on("incoming", (call: any) => {
    if (currentCall) {
      call.reject();
      return;
    }
    currentCall = call;
    notify("connected");

    call.on("disconnect", () => {
      currentCall = null;
      notify("ended");
    });

    call.accept();
  });

  notify("idle");
}

async function refreshToken() {
  if (!device) {
    return;
  }

  const res = await fetch("/api/voice/token", {
    credentials: "include",
  });

  if (!res.ok) return;

  const { token } = await res.json();
  device.updateToken(token);
}

export function startCall(params: Record<string, string>) {
  if (currentCall) {
    console.warn("Call already active");
    return;
  }

  if (!device) return;

  notify("connecting");
  currentCall = device.connect({ params });

  currentCall.on("accept", () => {
    notify("connected");
  });

  currentCall.on("disconnect", () => {
    currentCall = null;
    notify("ended");
  });

  currentCall.on("cancel", () => {
    currentCall = null;
    notify("ended");
  });

  currentCall.on("reject", () => {
    currentCall = null;
    notify("ended");
  });

  currentCall.on("error", () => {
    currentCall = null;
    notify("error");
  });
}

export function endCall() {
  if (currentCall) {
    currentCall.disconnect();
    currentCall = null;
  }

  notify("ended");
}

export function destroyClientVoice() {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }

  if (currentCall) {
    currentCall.disconnect();
    currentCall = null;
  }

  if (device) {
    device.destroy();
    device = null;
  }

  notify("idle");
}
