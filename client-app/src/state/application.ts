import { create } from "zustand";

export interface BusinessInfo {
  legalBusinessName: string;
  operatingName: string;
  businessNumber: string;
  industry: string;
  businessStartDate: string;
  annualRevenue: string;
  numberOfEmployees: string;
  website: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  city: string;
  province: string;
  postalCode: string;
}

export type Step1Data = Record<string, unknown>;

export interface ApplicantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  homeAddress: string;
  city: string;
  province: string;
  postalCode: string;
  dateOfBirth: string;
  ownershipPercentage: string;
}

export interface BusinessPartner {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ownershipPercentage: string;
}

export interface RequiredDoc {
  id: string;
  name: string;
  description?: string;
  category: string;
  required: boolean;
}

export interface UploadedDocument {
  docId: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  serverKey?: string;
  uploadedAt: string;
}

interface ApplicationState {
  step1: Step1Data | null;
  business: BusinessInfo | null;

  applicant: ApplicantInfo | null;
  partners: BusinessPartner[];

  requiredDocs: RequiredDoc[];
  uploadedDocs: UploadedDocument[];

  selectedProductCategory: string | number | null;

  setStep1: (data: Step1Data) => void;
  setApplicant: (data: Partial<ApplicantInfo>) => void;
  setBusiness: (data: Partial<BusinessInfo>) => void;
  setPartners: (partners: BusinessPartner[]) => void;

  setRequiredDocs: (docs: RequiredDoc[]) => void;
  addUploadedDoc: (doc: UploadedDocument) => void;
  removeUploadedDoc: (docId: string) => void;

  setSelectedProductCategory: (value: string | number | null) => void;
  goToNext: () => void;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  step1: null,
  business: null,
  applicant: null,
  partners: [],
  requiredDocs: [],
  uploadedDocs: [],
  selectedProductCategory: null,

  setStep1: (data) => set({ step1: data }),
  setApplicant: (data) =>
    set((state) => ({
      applicant: { ...(state.applicant ?? {}), ...data } as ApplicantInfo,
    })),

  setBusiness: (data) =>
    set((state) => ({
      business: { ...(state.business ?? {}), ...data } as BusinessInfo,
    })),

  setPartners: (partners) => set({ partners }),

  setRequiredDocs: (docs) => set({ requiredDocs: docs }),

  addUploadedDoc: (doc) =>
    set((state) => ({
      uploadedDocs: [
        ...state.uploadedDocs.filter((d) => d.docId !== doc.docId),
        doc,
      ],
    })),

  removeUploadedDoc: (docId) =>
    set((state) => ({
      uploadedDocs: state.uploadedDocs.filter((d) => d.docId !== docId),
    })),

  setSelectedProductCategory: (value) => set({ selectedProductCategory: value }),
  goToNext: () => {
    if (typeof window !== "undefined") {
      window.location.href = "/application/step3";
    }
  },
}));

export const useApplication = useApplicationStore;
