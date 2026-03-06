export const WIZARD_STEPS = [
  "Step1_KYC",
  "Step2_Business",
  "Step3_Financials",
  "Step4_Funding",
  "Step5_Documents",
  "Step6_TermsSignature",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];
