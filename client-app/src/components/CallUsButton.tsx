import { useClientCall } from "../telephony/hooks/useClientCall";

export default function CallUsButton() {
  const { isCalling, startCall, hangup } = useClientCall();

  return (
    <div className="flex flex-col items-center gap-2">
      {!isCalling && (
        <button
          onClick={startCall}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Call Us
        </button>
      )}

      {isCalling && (
        <button
          onClick={hangup}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Hang Up
        </button>
      )}
    </div>
  );
}
