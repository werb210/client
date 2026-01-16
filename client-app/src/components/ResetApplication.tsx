import { OfflineStore } from "../state/offline";
import { theme } from "../styles/theme";

export function ResetApplication() {
  function reset() {
    OfflineStore.clear();
    window.location.href = "/apply/step-1";
  }

  return (
    <button
      onClick={reset}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        fontSize: theme.typography.label.fontSize,
        color: theme.colors.primary,
        textDecoration: "underline",
        textUnderlineOffset: "4px",
        cursor: "pointer",
        outline: "none",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      Start over
    </button>
  );
}
