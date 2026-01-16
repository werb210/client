import { theme } from "@/styles/theme";

export function Card({ children, className = "", style = {} }: any) {
  return (
    <div
      className={className}
      style={{
        background: theme.colors.surface,
        borderRadius: theme.layout.radius,
        border: `1px solid ${theme.colors.border}`,
        padding: theme.spacing.lg,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
