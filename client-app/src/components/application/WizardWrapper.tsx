import { ReactNode } from "react";

type Props = {
  stepNumber: number;
  totalSteps: number;
  children: ReactNode;
};

const WizardWrapper = ({ stepNumber, totalSteps, children }: Props) => {
  return (
    <div>
      <p style={{ fontSize: "14px", color: "#666" }}>
        Step {stepNumber} of {totalSteps}
      </p>
      <div style={{ marginTop: "16px" }}>{children}</div>
    </div>
  );
};

export default WizardWrapper;
