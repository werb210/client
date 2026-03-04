import { useState } from "react";
import { initializeClientVoice, startClientCall } from "../services/clientVoice";
import { fetchVoiceToken } from "../../api/voice";

export default function CallUsButton() {
  const [calling, setCalling] = useState(false);

  const handleCall = async () => {
    if (calling) return;

    try {
      setCalling(true);

      const token = await fetchVoiceToken("client_user");
      await initializeClientVoice(token);
      await startClientCall();
    } catch {
      setCalling(false);
    }
  };

  return (
    <button
      onClick={handleCall}
      disabled={calling}
      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {calling ? "Connecting..." : "Call Us"}
    </button>
  );
}
