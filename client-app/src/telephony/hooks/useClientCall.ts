import { useEffect, useRef, useState } from "react";
import {
  hangupClientCall,
  isClientVoiceReady,
  startClientCall,
  subscribeToClientCall
} from "../services/clientVoice";

export type ClientCallStatus = "idle" | "connecting" | "in_call";

export class ClientCallError extends Error {
  code: "DEVICE_NOT_READY";

  constructor(message: string, code: "DEVICE_NOT_READY") {
    super(message);
    this.name = "ClientCallError";
    this.code = code;
  }
}

export function useClientCall() {
  const [status, setStatus] = useState<ClientCallStatus>("idle");
  const statusRef = useRef<ClientCallStatus>("idle");

  const updateStatus = (nextStatus: ClientCallStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  };

  useEffect(() => {
    return subscribeToClientCall((call) => {
      updateStatus(call ? "in_call" : "idle");
    });
  }, []);

  async function startCall() {
    if (statusRef.current !== "idle") {
      return;
    }

    updateStatus("connecting");

    if (!isClientVoiceReady()) {
      updateStatus("idle");
      throw new ClientCallError("Voice device not initialized", "DEVICE_NOT_READY");
    }

    try {
      await startClientCall();
      updateStatus("in_call");
    } catch (error) {
      updateStatus("idle");
      throw error;
    }
  }

  function hangup() {
    hangupClientCall();
    updateStatus("idle");
  }

  return {
    status,
    startCall,
    hangup
  };
}
