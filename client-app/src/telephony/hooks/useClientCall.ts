import { useRef, useState } from "react";
import { getVoiceDevice } from "@/telephony/voiceClient";

export type ClientCallStatus = "idle" | "connecting" | "connected" | "ended" | "error";

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
  const activeCallRef = useRef<any>(null);

  async function startCall() {
    if (status === "connecting" || status === "connected") return;

    setStatus("connecting");
    const device = getVoiceDevice();
    if (!device) {
      setStatus("error");
      throw new ClientCallError("Voice device not initialized", "DEVICE_NOT_READY");
    }

    try {
      const call = await device.connect({ params: { To: "staff" } });
      activeCallRef.current = call;
      setStatus("connected");

      call.on("disconnect", () => {
        activeCallRef.current = null;
        setStatus("ended");
      });
    } catch (error) {
      setStatus("error");
      throw error;
    }
  }

  function hangup() {
    activeCallRef.current?.disconnect?.();
    activeCallRef.current = null;
    setStatus("ended");
  }

  return { status, startCall, hangup };
}
