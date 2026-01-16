import type { ReactNode } from "react";

type WizardLayoutProps = {
  children: ReactNode;
};

export function WizardLayout({ children }: WizardLayoutProps) {
  return <div className="max-w-3xl mx-auto px-6 py-10">{children}</div>;
}

export default WizardLayout;
