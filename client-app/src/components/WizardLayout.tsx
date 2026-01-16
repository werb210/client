import type { ReactNode } from "react";
import { theme } from "@/styles/theme";

type WizardLayoutProps = {
  children: ReactNode;
};

export function WizardLayout({ children }: WizardLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.colors.background,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily,
        display: "flex",
        justifyContent: "center",
        padding: theme.layout.padding,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: theme.layout.maxWidth,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.lg,
        }}
      >
        <div
          style={{
            background: theme.colors.surface,
            borderRadius: theme.layout.radius,
            border: `1px solid ${theme.colors.border}`,
            padding: theme.layout.padding,
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.lg,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default WizardLayout;
