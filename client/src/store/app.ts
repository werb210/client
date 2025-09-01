import { create } from 'zustand';

type Intake = Record<string, any>;

type Step2 = {
  selectedCategory?: string;
  selectedCategoryName?: string;
  selectedProductId?: string;
  selectedProductName?: string;
  selectedLenderName?: string;
  matchScore?: number;
};

type Documents = { 
  uploadedDocuments: any[]; 
  bypassedDocuments: string[]; 
};

type Signature = { 
  completed?: boolean; 
  signedAt?: string; 
  documentId?: string; 
  signUrl?: string; 
};

type Consents = { 
  communicationConsent?: boolean; 
  documentMaintenanceConsent?: boolean; 
};

type AppState = {
  intake: Intake;
  step2: Step2;
  documents: Documents;
  signature: Signature;
  consents: Consents;
  set: (p: Partial<AppState>) => void;
};

export const useApp = create<AppState>((set: (partial: Partial<AppState>) => void) => ({
  intake: {}, 
  step2: {}, 
  documents: { 
    uploadedDocuments: [], 
    bypassedDocuments: [] 
  },
  signature: {}, 
  consents: {}, 
  set: (p: Partial<AppState>) => set(p),
}));