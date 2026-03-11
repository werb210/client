import { ApplicationData } from "../types/application";

export type ApplicationDraft = ApplicationData["applicationDraft"];

export const emptyApplicationDraft: ApplicationDraft = {
  borrower: {},
  company: {},
  financials: {},
  application: {},
  documents: [],
};
