export interface WizardField {
  name: string
  file: string
}

export interface WizardStepInventory {
  step: string
  file: string
  fields: WizardField[]
}

/*
LOCKED V1 FLOW (DO NOT CHANGE)

1  KYC QUESTIONS
2  PRODUCT CATEGORY
3  BUSINESS INFO
4  APPLICANT INFO
5  REQUIRED DOCUMENTS
6  TERMS + SIGNATURE
*/

export const WIZARD_FIELD_INVENTORY: WizardStepInventory[] = [

  {
    step: "Step1_KYC",
    file: "Step1_KYC.tsx",
    fields: [
      { name: "kyc_answers", file: "Step1_KYC.tsx" }
    ]
  },

  {
    step: "Step2_ProductCategory",
    file: "Step2_ProductCategory.tsx",
    fields: [
      { name: "product_category", file: "Step2_ProductCategory.tsx" }
    ]
  },

  {
    step: "Step3_BusinessDetails",
    file: "Step3_BusinessDetails.tsx",
    fields: [
      { name: "business_info", file: "Step3_BusinessDetails.tsx" }
    ]
  },

  {
    step: "Step4_ApplicantInformation",
    file: "Step4_ApplicantInformation.tsx",
    fields: [
      { name: "applicant_info", file: "Step4_ApplicantInformation.tsx" }
    ]
  },

  {
    step: "Step5_Documents",
    file: "Step5_Documents.tsx",
    fields: [
      { name: "bank_statements", file: "Step5_Documents.tsx" },
      { name: "financial_statements", file: "Step5_Documents.tsx" },
      { name: "tax_returns", file: "Step5_Documents.tsx" },
      { name: "contracts", file: "Step5_Documents.tsx" },
      { name: "invoices", file: "Step5_Documents.tsx" }
    ]
  },

  {
    step: "Step6_TermsSignature",
    file: "Step6_TermsSignature.tsx",
    fields: [
      { name: "signature", file: "Step6_TermsSignature.tsx" }
    ]
  }

]
