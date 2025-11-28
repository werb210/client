import { create } from "zustand";

export type ProductCategory =
  | "loc"
  | "term_loan"
  | "factoring"
  | "equipment"
  | "micro_loan"
  | null;

export interface ApplicationStore {
  email: string;
  phone: string;
  productCategory: ProductCategory;
  businessInfo: Record<string, unknown>;
  applicantInfo: Record<string, unknown>;
  documents: Record<string, unknown>[];
  signature: string | null;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setProductCategory: (category: ProductCategory) => void;
  setBusinessInfo: (info: Record<string, unknown>) => void;
  setApplicantInfo: (info: Record<string, unknown>) => void;
  setDocuments: (docs: Record<string, unknown>[]) => void;
  setSignature: (sig: string | null) => void;
  resetAll: () => void;
}

const initialState = {
  email: "",
  phone: "",
  productCategory: null as ProductCategory,
  businessInfo: {} as Record<string, unknown>,
  applicantInfo: {} as Record<string, unknown>,
  documents: [] as Record<string, unknown>[],
  signature: null as string | null,
};

export const useApplicationStore = create<ApplicationStore>((set) => ({
  ...initialState,
  setEmail: (email) => set({ email }),
  setPhone: (phone) => set({ phone }),
  setProductCategory: (category) => set({ productCategory: category }),
  setBusinessInfo: (info) => set({ businessInfo: info }),
  setApplicantInfo: (info) => set({ applicantInfo: info }),
  setDocuments: (docs) => set({ documents: docs }),
  setSignature: (sig) => set({ signature: sig }),
  resetAll: () => set({ ...initialState }),
}));

export default useApplicationStore;
