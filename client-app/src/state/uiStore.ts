import { create } from "zustand";

interface UIState {
  loading: boolean;
  loadingMessage: string | null;

  showLoading: (msg?: string) => void;
  hideLoading: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  loadingMessage: null,

  showLoading: (msg) =>
    set({
      loading: true,
      loadingMessage: msg || "Please wait...",
    }),

  hideLoading: () =>
    set({
      loading: false,
      loadingMessage: null,
    }),
}));
