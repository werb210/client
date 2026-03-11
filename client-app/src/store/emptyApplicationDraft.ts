export interface ApplicationDraft {
  businessName?: string
  businessType?: string
  industry?: string
  yearsInBusiness?: string
  requestedAmount?: number
  useOfFunds?: string
}

export const emptyApplicationDraft: ApplicationDraft = {
  businessName: "",
  businessType: "",
  industry: "",
  yearsInBusiness: "",
  requestedAmount: 0,
  useOfFunds: ""
}
