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

interface ApplicationState {
  step1: Record<string, unknown> | null;
  applicant: Record<string, unknown> | null;
  business: BusinessInfo | null;
  setStep1: (data: Record<string, unknown>) => void;
  setApplicant: (data: Record<string, unknown>) => void;
  setBusiness: (data: Partial<BusinessInfo>) => void;
}

export const useApplication = create<ApplicationState>((set) => ({
  step1: null,
  applicant: null,
  business: null,

  setStep1: (data) => set({ step1: data }),
  setApplicant: (data) => set({ applicant: data }),

  setBusiness: (data) =>
    set((state) => ({
      business: { ...(state.business ?? {}), ...data } as BusinessInfo,
    })),
}));
