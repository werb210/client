import { ReactNode } from "react";

export default function WizardLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
