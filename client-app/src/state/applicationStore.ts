import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiUpdateApplicationDraft } from "@/api/application";

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

type ApplicationDraft = {
  id?: string | null;
  step?: number;
  data?: Record<string, any>;
};

export interface ApplicationState {
  step: number;
  data: Record<string, any>;
  applicationId: string | null;

  email: string;
  phone: string;
  productCategory: ProductCategory;
  businessInfo: BusinessInfoData;
  applicantInfo: ApplicantInfoData;
  documents: Record<string, File | null>;
  signature: string | null;

  setStep: (n: number) => void;
  updateField: (section: string, field: string, value: any) => void;
  saveToServer: (token: string | null) => Promise<void>;
  loadServerDraft: (draft: ApplicationDraft) => void;

  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setProductCategory: (category: ProductCategory) => void;
  setBusinessInfo: (info: BusinessInfoData) => void;
  setApplicantInfo: (info: ApplicantInfoData) => void;
  setDocuments: (docs: Record<string, File | null>) => void;
  setSignature: (sig: string | null) => void;
  resetAll: () => void;
  clearApplication: () => void;
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
  step: 1,
  data: {},
  applicationId: null as string | null,

  email: "",
  phone: "",
  productCategory: null as ProductCategory,
  businessInfo: { ...emptyBusinessInfo },
  applicantInfo: { ...emptyApplicantInfo },
  documents: {} as Record<string, File | null>,
  signature: null as string | null,
};

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (n) => set({ step: n }),

      updateField: (section, field, value) => {
        const current = get().data || {};
        const nextSection = { ...(current[section] || {}), [field]: value };
        set({
          data: {
            ...current,
            [section]: nextSection,
          },
          ...(section === "business"
            ? { businessInfo: { ...(get().businessInfo || {}), [field]: value } }
            : {}),
          ...(section === "applicant"
            ? { applicantInfo: { ...(get().applicantInfo || {}), [field]: value } }
            : {}),
          ...(section === "documents"
            ? { documents: nextSection as Record<string, File | null> }
            : {}),
          ...(section === "contact" && field === "email" ? { email: value } : {}),
          ...(section === "contact" && field === "phone" ? { phone: value } : {}),
          ...(section === "selection" && field === "productCategory"
            ? { productCategory: value as ProductCategory }
            : {}),
        });
      },

      saveToServer: async (token) => {
        const { applicationId, data, step } = get();
        if (!token) return;

        await apiUpdateApplicationDraft({
          applicationId,
          payload: data,
          step,
          token,
        });
      },

      loadServerDraft: (draft) => {
        const draftData = draft?.data || {};
        const businessDraft = {
          ...emptyBusinessInfo,
          ...(draftData.business || {}),
        };
        const applicantDraft = {
          ...emptyApplicantInfo,
          ...(draftData.applicant || {}),
        };
        set({
          data: draftData,
          applicationId: draft?.id || null,
          step: draft?.step || 1,
          businessInfo: businessDraft,
          applicantInfo: applicantDraft,
          documents: (draftData.documents || {}) as Record<string, File | null>,
          email: draftData.contact?.email || "",
          phone: draftData.contact?.phone || "",
          productCategory: (draftData.selection?.productCategory || null) as ProductCategory,
        });
      },

      setEmail: (email) =>
        set((state) => ({
          email,
          data: { ...state.data, contact: { ...(state.data.contact || {}), email } },
        })),
      setPhone: (phone) =>
        set((state) => ({
          phone,
          data: { ...state.data, contact: { ...(state.data.contact || {}), phone } },
        })),
      setProductCategory: (category) =>
        set((state) => ({
          productCategory: category,
          data: {
            ...state.data,
            selection: { ...(state.data.selection || {}), productCategory: category },
          },
        })),
      setBusinessInfo: (info) =>
        set((state) => ({
          businessInfo: info,
          data: { ...state.data, business: info },
        })),
      setApplicantInfo: (info) =>
        set((state) => ({
          applicantInfo: info,
          data: { ...state.data, applicant: info },
        })),
      setDocuments: (docs) =>
        set((state) => ({
          documents: docs,
          data: { ...state.data, documents: docs },
        })),
      setSignature: (sig) => set({ signature: sig }),
      resetAll: () =>
        set({
          ...initialState,
          businessInfo: { ...emptyBusinessInfo },
          applicantInfo: { ...emptyApplicantInfo },
        }),
      clearApplication: () =>
        set({
          ...initialState,
          businessInfo: { ...emptyBusinessInfo },
          applicantInfo: { ...emptyApplicantInfo },
        }),
    }),
    {
      name: "client-application-autosave",
    }
  )
);

export default useApplicationStore;
