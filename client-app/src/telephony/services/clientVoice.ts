import { Device, Call } from "@twilio/voice-sdk";

type KnownTwilioCallEvent =
  | "accept"
  | "disconnect"
  | "cancel"
  | "reject"
  | "error"
  | "mute"
  | "unmute";

function onTwilioCallEvent(call: unknown, event: KnownTwilioCallEvent, handler: (...args: any[]) => void) {
  // Twilio JS SDK supports these at runtime; some versions’ type defs omit cancel/reject.
  (call as any)?.on?.(event, handler);
}

let device: Device | null = null;
let activeCall: Call | null = null;
let initializePromise: Promise<void> | null = null;
let callWithBoundHandlers: Call | null = null;

const listeners = new Set<(call: Call | null) => void>();

function notifyCallState() {
  listeners.forEach((listener) => listener(activeCall));
}

function clearActiveCall() {
  callWithBoundHandlers = null;
  activeCall = null;
  notifyCallState();
}

function setActiveCall(call: Call) {
  activeCall = call;

  if (callWithBoundHandlers !== call) {
    const handleDisconnect = () => {
      clearActiveCall();
    };
    const handleCancel = () => {
      clearActiveCall();
    };
    const handleReject = () => {
      clearActiveCall();
    };

    onTwilioCallEvent(call, "disconnect", handleDisconnect);
    onTwilioCallEvent(call, "cancel", handleCancel);
    onTwilioCallEvent(call, "reject", handleReject);

    callWithBoundHandlers = call;
  }

  notifyCallState();
}

export function subscribeToClientCall(listener: (call: Call | null) => void) {
  listeners.add(listener);
  listener(activeCall);
  return () => {
    listeners.delete(listener);
  };
}

export function isClientVoiceReady() {
  return device !== null;
}

export async function initializeClientVoice(token: string | null) {
  if (device) {
    return;
  }

  if (initializePromise) {
    return initializePromise;
  }

  if (!token) {
    console.warn("Voice disabled: no token available");
    return;
  }

  initializePromise = (async () => {
    try {
      device = new Device(token, {
        logLevel: 1,
      });

      device.on("registered", () => {
        console.log("Twilio device registered");
      });

      device.on("incoming", (call: Call) => {
        setActiveCall(call);
        call.accept();
      });

      (device as any).on("error", (err: unknown) => {
        console.warn("Twilio device error:", err);
      });

      await device.register();
    } catch (err) {
      console.warn("Voice initialization failed:", err);
      device = null;
    }
  })();

  try {
    await initializePromise;
  } finally {
    initializePromise = null;
  }
}

export async function startClientCall() {
  if (!device) {
    throw new Error("Voice device not initialized");
  }

  const call = await device.connect({
    params: {
      To: "staff"
    }
  });

  setActiveCall(call);
}

export function hangupClientCall() {
  activeCall?.disconnect();
  clearActiveCall();
}
