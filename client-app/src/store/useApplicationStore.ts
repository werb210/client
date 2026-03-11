import { create } from "zustand"

export type ApplicationDraft = {
  businessName?: string
  legalName?: string
  phone?: string
  email?: string
  industry?: string
  revenue?: number
  requestedAmount?: number
}

export const emptyApplicationDraft: ApplicationDraft = {
  businessName: "",
  legalName: "",
  phone: "",
  email: "",
  industry: "",
  revenue: 0,
  requestedAmount: 0
}

type ApplicationStore = {
  draft: ApplicationDraft
  setDraft: (partial: Partial<ApplicationDraft>) => void
  resetDraft: () => void
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  draft: emptyApplicationDraft,

  setDraft: (partial) =>
    set((state) => ({
      draft: { ...state.draft, ...partial }
    })),

  resetDraft: () =>
    set({
      draft: emptyApplicationDraft
    })
}))
