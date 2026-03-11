import { create } from "zustand";

export type ApplicationDraft = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  requestedAmount: number | null;
  productType: string | null;
};

export const emptyApplicationDraft: ApplicationDraft = {
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  requestedAmount: null,
  productType: null,
};

type ApplicationState = {
  draft: ApplicationDraft;
  setDraft: (data: Partial<ApplicationDraft>) => void;
  resetDraft: () => void;
};

export const useApplicationStore = create<ApplicationState>((set) => ({
  draft: emptyApplicationDraft,

  setDraft: (data) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...data,
      },
    })),

  resetDraft: () =>
    set({
      draft: emptyApplicationDraft,
    }),
}));
