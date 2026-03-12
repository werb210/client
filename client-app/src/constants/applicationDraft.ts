export interface ApplicationDraft {
  borrower: Record<string, unknown>
  company: Record<string, unknown>
  financials: Record<string, unknown>
  application: Record<string, unknown>
  documents: Array<Record<string, unknown>>
}

export const emptyApplicationDraft: ApplicationDraft = {
  borrower: {},
  company: {},
  financials: {},
  application: {},
  documents: []
}
