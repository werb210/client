import type { ReactNode } from "react";
import { layout, components } from "@/styles";
import { OfflineBanner } from "./OfflineBanner";
import AIChat from "./AIChat";

type WizardLayoutProps = {
  children: ReactNode;
};

export function WizardLayout({ children }: WizardLayoutProps) {
  return (
    <div style={{ ...layout.page, display: "flex", justifyContent: "center" }}>
      <div style={layout.centerColumn}>
        <OfflineBanner />
        <div
          style={{
            ...components.card.base,
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {children}
        </div>
      </div>
      <AIChat />
    </div>
  );
}

export default WizardLayout;
