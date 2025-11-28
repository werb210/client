import { create } from "zustand";

export type ProductCategory =
  | "loc"
  | "term_loan"
  | "factoring"
  | "equipment"
  | "micro_loan"
  | null;

export type ApplicantInfoData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  homeAddress: string;
  city: string;
  province: string;
  postalCode: string;
  sin: string;
  dateOfBirth: string;
  creditScoreBand: string;
  hasBusinessPartner: boolean;
  partnerFirstName?: string;
  partnerLastName?: string;
  partnerEmail?: string;
  partnerPhone?: string;
};

export type BusinessInfoData = {
  businessName: string;
  businessWebsite?: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  businessCity: string;
  businessProvince: string;
  businessPostalCode: string;
  industry: string;
  timeInBusiness: string;
  monthlyRevenue: string;
  yearsInBusiness: string;
  hasBusinessPartner: boolean;
};

export interface ApplicationStore {
  email: string;
  phone: string;
  productCategory: ProductCategory;
  businessInfo: BusinessInfoData;
  applicantInfo: ApplicantInfoData;
  documents: Record<string, unknown>[];
  signature: string | null;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setProductCategory: (category: ProductCategory) => void;
  setBusinessInfo: (info: BusinessInfoData) => void;
  setApplicantInfo: (info: ApplicantInfoData) => void;
  setDocuments: (docs: Record<string, unknown>[]) => void;
  setSignature: (sig: string | null) => void;
  resetAll: () => void;
}

export const emptyBusinessInfo: BusinessInfoData = {
  businessName: "",
  businessWebsite: "",
  businessPhone: "",
  businessEmail: "",
  businessAddress: "",
  businessCity: "",
  businessProvince: "",
  businessPostalCode: "",
  industry: "",
  timeInBusiness: "",
  monthlyRevenue: "",
  yearsInBusiness: "",
  hasBusinessPartner: false,
};

export const emptyApplicantInfo: ApplicantInfoData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  homeAddress: "",
  city: "",
  province: "",
  postalCode: "",
  sin: "",
  dateOfBirth: "",
  creditScoreBand: "",
  hasBusinessPartner: false,
  partnerFirstName: "",
  partnerLastName: "",
  partnerEmail: "",
  partnerPhone: "",
};

const initialState = {
  email: "",
  phone: "",
  productCategory: null as ProductCategory,
  businessInfo: { ...emptyBusinessInfo },
  applicantInfo: { ...emptyApplicantInfo },
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
  resetAll: () =>
    set({
      ...initialState,
      businessInfo: { ...emptyBusinessInfo },
      applicantInfo: { ...emptyApplicantInfo },
    }),
}));

export default useApplicationStore;
