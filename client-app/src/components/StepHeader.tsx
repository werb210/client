import { components, tokens } from "@/styles";

type StepHeaderProps = {
  step: number;
  title: string;
};

export function StepHeader({ step, title }: StepHeaderProps) {
  return (
    <div style={{ marginBottom: tokens.spacing.lg }}>
      <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
        <div
          style={{
            ...components.form.eyebrow,
            marginBottom: tokens.spacing.sm,
          }}
        >
          Step {step}
        </div>
      </div>
      <div
        style={{
          height: "4px",
          width: "60px",
          borderRadius: tokens.radii.pill,
          background: tokens.colors.border,
          marginBottom: tokens.spacing.sm,
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            borderRadius: tokens.radii.pill,
            background: tokens.colors.primary,
          }}
        />
      </div>
      <h1 style={components.form.title}>{title}</h1>
    </div>
  );
}
