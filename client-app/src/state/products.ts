import { create } from "zustand";

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string | null;
}

interface ProductState {
  categories: ProductCategory[] | null;
  setCategories: (c: ProductCategory[]) => void;
}

export const useProducts = create<ProductState>((set) => ({
  categories: null,
  setCategories: (c) => set({ categories: c })
}));
