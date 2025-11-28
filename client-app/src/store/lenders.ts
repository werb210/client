import { create } from "zustand";
import { LenderCategory } from "../types/lenders";

interface LenderState {
  categories: LenderCategory[];
  setCategories: (data: LenderCategory[]) => void;
}

export const useLenders = create<LenderState>((set) => ({
  categories: [],
  setCategories: (data) => set({ categories: data }),
}));
