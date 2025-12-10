import { OfflineStore } from "../state/offline";

export function ResetApplication() {
  function reset() {
    OfflineStore.clear();
    window.location.href = "/apply/step-1";
  }

  return (
    <button onClick={reset} className="text-sm text-red-600 underline">
      Reset Application
    </button>
  );
}
