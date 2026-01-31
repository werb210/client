import type {
  EligibilityCategorySummary,
  EligibilityReasonSummary,
  NormalizedLenderProduct,
} from "../lender/eligibility";

export type SelectedProduct = {
  id: string;
  name: string;
  product_type: string;
  lender_id: string;
};

export interface ApplicationData {
  kyc: any;
  productCategory: string | null;
  matchPercentages: Record<string, number>;
  eligibleProducts: NormalizedLenderProduct[];
  eligibleCategories: EligibilityCategorySummary[];
  eligibilityReasons: EligibilityReasonSummary[];
  business: any;
  applicant: any;
  documents: Record<
    string,
    {
      name: string;
      base64: string;
      category: string;
      productId?: string;
      status?: "uploaded" | "accepted" | "rejected";
    }
  >;
  productRequirements?: Record<
    string,
    {
      id: string;
      document_type: string;
      required: boolean;
      min_amount?: number | null;
      max_amount?: number | null;
    }[]
  >;
  documentsDeferred?: boolean;
  selectedProduct?: SelectedProduct;
  selectedProductId?: string;
  selectedProductType?: string;

  /**
   * Indicates whether the applicant requires additional funding to cover
   * closing costs or a deposit for an equipment purchase.
   * Captured in Step 2 when Equipment Financing is selected.
   */
  requires_closing_cost_funding?: boolean;

  termsAccepted: boolean;
  typedSignature?: string;
  coApplicantSignature?: string;
  signatureDate?: string;
  applicationToken?: string;
  applicationId?: string;
  currentStep?: number;
  linkedApplicationTokens?: string[];
  ocrComplete?: boolean;
  creditSummaryComplete?: boolean;
}
