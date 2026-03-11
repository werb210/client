import { create } from "zustand"
import {
  ApplicationDraft,
  emptyApplicationDraft
} from "./emptyApplicationDraft"

export interface ApplicationStore {
  draft: ApplicationDraft
  setDraft: (partial: Partial<ApplicationDraft>) => void
  resetDraft: () => void
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  draft: emptyApplicationDraft,

  setDraft: (partial) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...partial
      }
    })),

  resetDraft: () =>
    set({
      draft: emptyApplicationDraft
    })
}))
