// One canonical key per concept (use these everywhere going forward)
export type CanonKey =
  // Step 1 – Financial
  | "country" | "industry" | "amount" | "useOfFunds"
  | "salesHistoryYears" | "annualRevenue" | "monthlyRevenue"
  | "accountsReceivableBalance" | "fixedAssetsValue" | "equipmentValue"
  // Step 2 – Product
  | "productCategory" | "productCategoryName" | "productId" | "productName" | "lenderName"
  // Step 3 – Business
  | "legalName" | "tradeName" | "businessStreet" | "businessCity" | "businessState" | "businessPostalCode"
  | "businessPhone" | "businessStartDate" | "businessStructure" | "employeeCount" | "businessWebsite"
  // Step 4 – Applicant
  | "applicantFirstName" | "applicantLastName" | "applicantEmail" | "applicantPhone"
  | "applicantAddress" | "applicantCity" | "applicantState" | "applicantPostalCode"
  | "applicantDob" | "applicantSsn" | "ownershipPercentage"
  | "hasPartner" | "partnerFirstName" | "partnerLastName" | "partnerEmail" | "partnerPhone"
  | "partnerAddress" | "partnerCity" | "partnerState" | "partnerPostalCode" | "partnerDob" | "partnerSsn" | "partnerOwnershipPercentage"
  // Step 5–7
  | "uploadedDocuments" | "signatureAccepted";

// For each canonical key, list every legacy/duplicate path we currently use.
// First hit wins. Extend this list if you discover more.
export const ALIASES: Record<CanonKey, string[]> = {
  // Step 1
  country: ["country", "businessLocation", "headquarters"],
  industry: ["industry", "formData.businessInfo.industry"],
  amount: ["amount", "fundingAmount", "requestedAmount", "loanAmount", "step1.requestedAmount"],
  useOfFunds: ["useOfFunds", "fundsPurpose", "purpose", "formData.businessInfo.useOfFunds"],
  salesHistoryYears: ["salesHistory", "yearsInBusiness"],
  annualRevenue: ["annualRevenue", "estimatedYearlyRevenue", "revenueLastYear", "last12moRevenue"],
  monthlyRevenue: ["monthlyRevenue", "avgMonthlyRevenue", "averageMonthlyRevenue"],
  accountsReceivableBalance: ["accountsReceivableBalance", "arBalance"],
  fixedAssetsValue: ["fixedAssetsValue", "fixedAssets"],
  equipmentValue: ["equipmentValue"],

  // Step 2
  productCategory: ["productCategory", "selectedCategory"],
  productCategoryName: ["productCategoryName", "selectedCategoryName"],
  productId: ["productId", "selectedProductId", "lenderProductId"],
  productName: ["productName", "selectedProductName"],
  lenderName: ["lenderName", "selectedLenderName"],

  // Step 3
  legalName: ["legalName", "businessName", "formData.businessInfo.legalName"],
  tradeName: ["tradeName", "operatingName"],
  businessStreet: ["businessStreet", "businessStreetAddress", "business.address.line1"],
  businessCity: ["businessCity", "business.address.city"],
  businessState: ["businessState", "headquartersState", "business.address.state"],
  businessPostalCode: ["businessPostalCode", "business.address.postal_code"],
  businessPhone: ["businessPhone"],
  businessStartDate: ["businessStartDate"],
  businessStructure: ["businessStructure"],
  employeeCount: ["employeeCount"],
  businessWebsite: ["businessWebsite", "website", "formData.businessInfo.website"],

  // Step 4
  applicantFirstName: ["applicantFirstName", "step4.firstName"],
  applicantLastName: ["applicantLastName", "step4.lastName"],
  applicantEmail: ["applicantEmail", "step4.email"],
  applicantPhone: ["applicantPhone", "step4.phone"],
  applicantAddress: ["applicantAddress"],
  applicantCity: ["applicantCity"],
  applicantState: ["applicantState"],
  applicantPostalCode: ["applicantPostalCode", "applicantZipCode"],
  applicantDob: ["applicantDob", "applicantDateOfBirth"],
  applicantSsn: ["applicantSsn", "applicantSSN"],
  ownershipPercentage: ["ownershipPercentage"],
  hasPartner: ["hasPartner"],
  partnerFirstName: ["partnerFirstName"],
  partnerLastName: ["partnerLastName"],
  partnerEmail: ["partnerEmail"],
  partnerPhone: ["partnerPhone"],
  partnerAddress: ["partnerAddress"],
  partnerCity: ["partnerCity"],
  partnerState: ["partnerState"],
  partnerPostalCode: ["partnerPostalCode", "partnerZipCode"],
  partnerDob: ["partnerDob", "partnerDateOfBirth"],
  partnerSsn: ["partnerSsn", "partnerSSN"],
  partnerOwnershipPercentage: ["partnerOwnershipPercentage"],

  // Step 5–7
  uploadedDocuments: ["uploadedDocuments", "formData.documents"],
  signatureAccepted: ["signatureAccepted", "termsAccepted", "signed"]
};