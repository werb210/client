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
        fontFamily: theme.fonts.base,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: theme.layout.maxWidth,
          padding: theme.layout.padding,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default WizardLayout;
