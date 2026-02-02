import { tokens } from "@/styles";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <div
      style={{
        background: "rgba(245, 158, 11, 0.35)",
        color: tokens.colors.textPrimary,
        padding: "8px 16px",
        textAlign: "center",
        fontWeight: 600,
      }}
    >
      You are offline — changes will sync when connection is restored.
    </div>
  );
}
