import { create } from "zustand";

interface Question {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "radio" | "boolean";
  options?: string[];
  required: boolean;
}

interface QuestionState {
  step1: Question[] | null;
  setStep1: (q: Question[]) => void;
}

export const useQuestions = create<QuestionState>((set) => ({
  step1: null,
  setStep1: (q) => set({ step1: q })
}));
