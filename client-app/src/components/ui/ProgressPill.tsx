import { components, tokens } from "@/styles";

type ProgressPillProps = {
  value: number;
};

export function ProgressPill({ value }: ProgressPillProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  let background = "rgba(11, 42, 74, 0.12)";
  let textColor = tokens.colors.textPrimary;

  if (clamped < 50) {
    background = "rgba(71, 85, 105, 0.12)";
    textColor = tokens.colors.textSecondary;
  } else if (clamped < 75) {
    background = "rgba(11, 42, 74, 0.2)";
  }

  return (
    <span
      style={{
        ...components.timeline.pill,
        background,
        color: textColor,
      }}
    >
      {clamped}% match
    </span>
  );
}
