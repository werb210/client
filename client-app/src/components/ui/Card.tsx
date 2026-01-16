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
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
