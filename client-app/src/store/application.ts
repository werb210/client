import { create } from "zustand";

import { Step1Payload } from "../types/application";

interface ApplicationState {
  step1: Step1Payload | null;
  setStep1: (data: Step1Payload) => void;
}

export const useApplication = create<ApplicationState>((set) => ({
  step1: null,
  setStep1: (data) => set({ step1: data })
}));
