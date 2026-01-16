import { theme } from "@/styles/theme";

export function StepHeader({ step, title }: { step: number; title: string }) {
  const progress = Math.min(100, Math.max(0, Math.round((step / 6) * 100)));
  return (
    <div style={{ marginBottom: theme.spacing.lg }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: theme.typography.label.fontSize,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.sm,
        }}
      >
        <span>Step {step} of 6</span>
        <span>{progress}% complete</span>
      </div>
      <div
        style={{
          height: "10px",
          width: "100%",
          borderRadius: "999px",
          background: theme.colors.border,
          marginBottom: theme.spacing.sm,
        }}
      >
        <div
          style={{
            height: "10px",
            borderRadius: "999px",
            background: theme.colors.primary,
            width: `${progress}%`,
          }}
        />
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: theme.typography.h1.fontSize,
          fontWeight: theme.typography.h1.fontWeight,
          lineHeight: theme.typography.h1.lineHeight,
          color: theme.colors.textPrimary,
        }}
      >
        {title}
      </h1>
    </div>
  );
}
