import { create } from "zustand";

interface AppState {
  isInitialized: boolean;
  setIsInitialized: (value: boolean) => void;
}

const useAppStore = create<AppState>((set) => ({
  isInitialized: false,
  setIsInitialized: (value) => set({ isInitialized: value }),
}));

export default useAppStore;
