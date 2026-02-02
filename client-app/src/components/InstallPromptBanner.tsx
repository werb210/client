import { useInstallPrompt } from "../pwa/useInstallPrompt";
import { Button } from "./ui/Button";
import { tokens } from "@/styles";

export function InstallPromptBanner() {
  const { canInstall, promptToInstall } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div
      style={{
        background: "rgba(29, 78, 216, 0.08)",
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
        Install the Boreal app for faster access and offline support.
      </div>
      <Button onClick={promptToInstall}>Install</Button>
    </div>
  );
}
