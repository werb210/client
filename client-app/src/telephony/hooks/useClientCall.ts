import { startClientCall, hangupClientCall } from "../services/clientVoice";
import { useState } from "react";

export function useClientCall() {
  const [isCalling, setIsCalling] = useState(false);

  async function startCall() {
    setIsCalling(true);
    try {
      await startClientCall();
    } finally {
      setIsCalling(false);
    }
  }

  function hangup() {
    hangupClientCall();
    setIsCalling(false);
  }

  return {
    isCalling,
    startCall,
    hangup
  };
}
