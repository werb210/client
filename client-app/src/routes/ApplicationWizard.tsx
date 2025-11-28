export type WizardStep = {
  step: number;
  label: string;
  path: string;
};

export const wizardSteps: WizardStep[] = [
  { step: 1, label: "KYC", path: "/application/step-1" },
  { step: 2, label: "Business Details", path: "/application/step-2" },
  { step: 3, label: "Product Category", path: "/application/step-3" },
  { step: 4, label: "Applicant Info", path: "/application/step-4" },
  { step: 5, label: "Documents Upload", path: "/application/step-5" },
  { step: 6, label: "Signature", path: "/application/step-6" },
  { step: 7, label: "Review & Submit", path: "/application/step-7" },
];

export const getNextStepPath = (currentStep: number): string | null => {
  const next = wizardSteps.find((s) => s.step === currentStep + 1);
  return next ? next.path : null;
};

export const getStepMetadata = (path: string): WizardStep | undefined =>
  wizardSteps.find((step) => step.path === path);
