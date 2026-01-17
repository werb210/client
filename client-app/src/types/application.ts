import type {
  EligibilityCategorySummary,
  EligibilityReasonSummary,
  NormalizedLenderProduct,
} from "../lender/eligibility";

export interface ApplicationData {
  kyc: any;
  productCategory: string | null;
  matchPercentages: Record<string, number>;
  eligibleProducts: NormalizedLenderProduct[];
  eligibleCategories: EligibilityCategorySummary[];
  eligibilityReasons: EligibilityReasonSummary[];
  business: any;
  applicant: any;
  documents: Record<string, { name: string; base64?: string; uploaded?: boolean }>;
  documentsDeferred?: boolean;

  /**
   * Indicates whether the applicant requires additional funding to cover
   * closing costs or a deposit for an equipment purchase.
   * Captured in Step 2 when Equipment Financing is selected.
   */
  requires_closing_cost_funding?: boolean;

  termsAccepted: boolean;
  typedSignature?: string;
  signatureDate?: string;
  applicationToken?: string;
  applicationId?: string;
  currentStep?: number;
}
