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

interface ApplicationState {
  step1: Step1Data | null;
  business: BusinessInfo | null;

  applicant: ApplicantInfo | null;
  partners: BusinessPartner[];

  setStep1: (data: Step1Data) => void;
  setApplicant: (data: Partial<ApplicantInfo>) => void;
  setBusiness: (data: Partial<BusinessInfo>) => void;
  setPartners: (partners: BusinessPartner[]) => void;
}

export const useApplication = create<ApplicationState>((set) => ({
  step1: null,
  business: null,
  applicant: null,
  partners: [],

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
}));
