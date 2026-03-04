import { useState } from "react";
import { useClientCall } from "../telephony/hooks/useClientCall";

export default function CallUsButton() {
  const { status, startCall, hangup } = useClientCall();
  const [error, setError] = useState<string | null>(null);

  const isIdle = status === "idle";
  const isConnecting = status === "connecting";
  const isInCall = status === "in_call";

  const handleClick = async () => {
    setError(null);

    if (isInCall) {
      hangup();
      return;
    }

    try {
      await startCall();
    } catch {
      setError("Call unavailable. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => void handleClick()}
        disabled={isConnecting}
        className={`text-white px-4 py-2 rounded ${
          isInCall ? "bg-red-600" : "bg-blue-600"
        } disabled:opacity-70`}
      >
        {isIdle && "Call Us"}
        {isConnecting && "Calling…"}
        {isInCall && "Hang Up"}
      </button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
