import { theme } from "@/styles/theme";

type ProgressPillProps = {
  value: number;
};

export function ProgressPill({ value }: ProgressPillProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  let background = "rgba(37, 99, 235, 0.15)";
  let textColor = theme.colors.textPrimary;

  if (clamped < 50) {
    background = "rgba(156, 163, 175, 0.15)";
    textColor = theme.colors.textSecondary;
  } else if (clamped < 75) {
    background = "rgba(37, 99, 235, 0.2)";
    textColor = theme.colors.textPrimary;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "999px",
        padding: "6px 12px",
        fontSize: "12px",
        fontWeight: 600,
        background,
        color: textColor,
      }}
    >
      {clamped}% match
    </span>
  );
}
