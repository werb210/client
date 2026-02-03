import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { tokens } from "@/styles";

type UpdateAvailableBannerProps = {
  updateAvailable: boolean;
  onApplyUpdate: () => void;
};

export function UpdateAvailableBanner({
  updateAvailable,
  onApplyUpdate,
}: UpdateAvailableBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!updateAvailable) {
      setDismissed(false);
    }
  }, [updateAvailable]);

  if (!updateAvailable || dismissed) return null;

  return (
    <div
      style={{
        background: "rgba(16, 185, 129, 0.12)",
        color: tokens.colors.textPrimary,
        padding: "10px 16px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: tokens.spacing.sm,
        borderBottom: `1px solid ${tokens.colors.border}`,
      }}
    >
      <div style={{ fontWeight: 600 }}>
        A new version is ready. Refresh to get the latest updates.
      </div>
      <div style={{ display: "flex", gap: tokens.spacing.xs }}>
        <Button variant="secondary" onClick={onApplyUpdate}>
          Refresh
        </Button>
        <Button variant="ghost" onClick={() => setDismissed(true)}>
          Later
        </Button>
      </div>
    </div>
  );
}
