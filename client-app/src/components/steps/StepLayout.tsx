import { ReactNode } from "react";
import "../../styles/steps.css";

export function StepLayout({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextDisabled,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="step-container">
      <div className="step-header">
        <h1 className="step-title">{title}</h1>
        {subtitle && <p className="step-subtitle">{subtitle}</p>}
      </div>

      <div className="step-body">{children}</div>

      <div className="step-footer">
        {onBack && (
          <button className="step-back" onClick={onBack}>
            Back
          </button>
        )}

        <button className="step-next" onClick={onNext} disabled={nextDisabled}>
          Next
        </button>
      </div>
    </div>
  );
}
