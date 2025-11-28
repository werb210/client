import { create } from "zustand";

import { Step1Payload } from "../types/application";

interface ApplicationState {
  step1: Step1Payload | null;
  setStep1: (
    data:
      | Step1Payload
      | null
      | ((data: Step1Payload | null) => Step1Payload | null)
  ) => void;
}

export const useApplication = create<ApplicationState>((set) => ({
  step1: null,
  setStep1: (data) =>
    set((state) => ({
      step1: typeof data === "function" ? data(state.step1) : data,
    })),
}));
