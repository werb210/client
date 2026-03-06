/**
 * V1 Wizard Field Inventory
 * Must reference REAL files under src/wizard/
 */

export const WIZARD_FIELD_INVENTORY = [
  {
    step: "Step1_KYC",
    fields: [
      { name: "legalName", file: "Step1_KYC.tsx" },
      { name: "businessNumber", file: "Step1_KYC.tsx" },
      { name: "email", file: "Step1_KYC.tsx" },
      { name: "phone", file: "Step1_KYC.tsx" },
    ],
  },

  {
    step: "Step2_ProductCategory",
    fields: [{ name: "productCategory", file: "Step2_ProductCategory.tsx" }],
  },

  {
    step: "Step3_BusinessDetails",
    fields: [
      { name: "industry", file: "Step3_BusinessDetails.tsx" },
      { name: "yearsInBusiness", file: "Step3_BusinessDetails.tsx" },
      { name: "province", file: "Step3_BusinessDetails.tsx" },
    ],
  },

  {
    step: "Step4_ApplicantInformation",
    fields: [
      { name: "ownerName", file: "Step4_ApplicantInformation.tsx" },
      { name: "ownershipPercent", file: "Step4_ApplicantInformation.tsx" },
      { name: "creditScore", file: "Step4_ApplicantInformation.tsx" },
    ],
  },

  {
    step: "Step5_Documents",
    fields: [
      { name: "bankStatements", file: "Step5_Documents.tsx" },
      { name: "financialStatements", file: "Step5_Documents.tsx" },
      { name: "taxReturns", file: "Step5_Documents.tsx" },
    ],
  },

  {
    step: "Step6_TermsSignature",
    fields: [
      { name: "agreeTerms", file: "Step6_TermsSignature.tsx" },
      { name: "signature", file: "Step6_TermsSignature.tsx" },
    ],
  },
]

export default WIZARD_FIELD_INVENTORY
