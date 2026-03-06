import fs from "fs"
import path from "path"

export interface WizardField {
  name: string
  file: string
}

export interface WizardStepInventory {
  step: string
  file: string
  fields: WizardField[]
}

const wizardDir = __dirname

function stepFile(name: string) {
  const filePath = path.join(wizardDir, name)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Wizard step file missing: ${name}`)
  }
  return name
}

export const WIZARD_FIELD_INVENTORY: WizardStepInventory[] = [
  {
    step: "kyc",
    file: stepFile("Step1_KYC.tsx"),
    fields: [{ name: "kyc_answers", file: "Step1_KYC.tsx" }]
  },
  {
    step: "product_category",
    file: stepFile("Step2_ProductCategory.tsx"),
    fields: [{ name: "product_category", file: "Step2_ProductCategory.tsx" }]
  },
  {
    step: "business_info",
    file: stepFile("Step3_BusinessDetails.tsx"),
    fields: [{ name: "business_info", file: "Step3_BusinessDetails.tsx" }]
  },
  {
    step: "applicant_info",
    file: stepFile("Step4_ApplicantInformation.tsx"),
    fields: [{ name: "applicant_info", file: "Step4_ApplicantInformation.tsx" }]
  },
  {
    step: "documents",
    file: stepFile("Step5_Documents.tsx"),
    fields: [
      { name: "bank_statements", file: "Step5_Documents.tsx" },
      { name: "financial_statements", file: "Step5_Documents.tsx" },
      { name: "tax_returns", file: "Step5_Documents.tsx" },
      { name: "contracts", file: "Step5_Documents.tsx" },
      { name: "invoices", file: "Step5_Documents.tsx" }
    ]
  },
  {
    step: "terms_signature",
    file: stepFile("Step6_TermsSignature.tsx"),
    fields: [{ name: "signature", file: "Step6_TermsSignature.tsx" }]
  }
]
