import { create } from "zustand"

export interface ApplicationDraft {
  businessName?: string
  businessType?: string
  industry?: string
  yearsInBusiness?: string
  requestedAmount?: number
  useOfFunds?: string
}

export interface ApplicationStore {
  draft: ApplicationDraft
  setDraft: (partial: Partial<ApplicationDraft>) => void
  resetDraft: () => void
}

/*
Define BEFORE store creation to avoid runtime reference error
*/
const emptyApplicationDraft: ApplicationDraft = {
  businessName: "",
  businessType: "",
  industry: "",
  yearsInBusiness: "",
  requestedAmount: 0,
  useOfFunds: ""
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  draft: emptyApplicationDraft,

  setDraft: (partial) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...partial
      }
    })),

  resetDraft: () =>
    set({
      draft: emptyApplicationDraft
    })
}))
