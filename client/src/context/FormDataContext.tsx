import { createContext, useContext, useReducer, ReactNode } from 'react';
import { ApplicationForm } from '../../../shared/schema';

// Base interface that extends ApplicationForm with additional UI properties
export interface FinancialProfileData extends Partial<ApplicationForm> {
  selectedCategory?: string;
  selectedCategoryName?: string;
  completed?: boolean;
}

// Business Details Data - matches shared schema exactly
export interface BusinessDetailsData extends Partial<ApplicationForm> {
  completed?: boolean;
}

// Financial Info Data - matches shared schema exactly  
export interface FinancialInfoData extends Partial<ApplicationForm> {
  completed?: boolean;
}

// Applicant Info Data - matches shared schema exactly
export interface ApplicantInfoData extends Partial<ApplicationForm> {
  completed?: boolean;
}

export interface DocumentUploadData {
  uploadedFiles?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    file?: File;
    status: 'uploading' | 'completed' | 'error';
    documentType: string;
  }>;
  completed?: boolean;
  completedAt?: string;
  savedAt?: string;
  categories?: Array<{
    id: string;
    name: string;
    documents: Array<{
      id: string;
      categoryId: string;
      name: string;
      size: number;
      status: 'uploading' | 'completed' | 'error';
      progress: number;
      url?: string;
      error?: string;
    }>;
    uploadLater: boolean;
  }>;
}

export interface FormDataState {
  step1FinancialProfile: FinancialProfileData;
  step2Recommendations?: {
    selectedProduct?: {
      id?: string;
      product_name?: string;
      lender_name?: string;
      product_type?: string;
    };
  };
  step3BusinessDetails?: BusinessDetailsData;
  step4FinancialInfo?: FinancialInfoData;
  step4ApplicantInfo?: ApplicantInfoData;
  step5DocumentUpload?: DocumentUploadData;
  step6Signature?: {
    signedAt?: string;
    documentId?: string;
    signingUrl?: string;
    completed?: boolean;
  };
  currentStep: number;
  isComplete: boolean;
  isCompleted?: boolean;
  applicationId?: string;
  signingUrl?: string;
  submissionStatus?: string;
  signingStatus?: string;
}

type FormDataAction =
  | { type: 'UPDATE_STEP1'; payload: Partial<FinancialProfileData> }
  | { type: 'UPDATE_STEP3'; payload: Partial<BusinessDetailsData> }
  | { type: 'UPDATE_STEP4'; payload: Partial<FinancialInfoData> }
  | { type: 'UPDATE_STEP4_APPLICANT'; payload: Partial<ApplicantInfoData> }
  | { type: 'UPDATE_STEP5'; payload: Partial<DocumentUploadData> }
  | { type: 'UPDATE_STEP6'; payload: Partial<FormDataState['step6Signature']> }
  | { type: 'UPDATE_STEP6_SIGNATURE'; payload: Partial<FormDataState['step6Signature']> }
  | { type: 'UPDATE_STEP4_SUBMISSION'; payload: Partial<FormDataState> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_APPLICATION_ID'; payload: string }
  | { type: 'SET_SIGNING_URL'; payload: string }
  | { type: 'MARK_COMPLETE' }
  | { type: 'LOAD_FROM_STORAGE'; payload: FormDataState };

const initialState: FormDataState = {
  step1FinancialProfile: {
    headquarters: undefined,
    headquartersState: undefined,
    industry: undefined,
    lookingFor: undefined,
    fundingAmount: undefined,
    fundsPurpose: undefined,
    salesHistory: undefined,
    revenueLastYear: undefined,
    averageMonthlyRevenue: undefined,
    accountsReceivableBalance: undefined,
    fixedAssetsValue: undefined,
  },
  currentStep: 1,
  isComplete: false,
};

function formDataReducer(state: FormDataState, action: FormDataAction): FormDataState {
  switch (action.type) {
    case 'UPDATE_STEP1':
      return {
        ...state,
        step1FinancialProfile: {
          ...state.step1FinancialProfile,
          ...action.payload,
        },
      };
    case 'UPDATE_STEP3':
      return {
        ...state,
        step3BusinessDetails: {
          ...state.step3BusinessDetails,
          ...action.payload,
        } as BusinessDetailsData,
      };
    case 'UPDATE_STEP4':
      return {
        ...state,
        step4FinancialInfo: {
          ...state.step4FinancialInfo,
          ...action.payload,
        } as FinancialInfoData,
      };
    case 'UPDATE_STEP4_APPLICANT':
      return {
        ...state,
        step4ApplicantInfo: {
          ...state.step4ApplicantInfo,
          ...action.payload,
        } as FormDataState['step4ApplicantInfo'],
      };
    case 'UPDATE_STEP5':
      return {
        ...state,
        step5DocumentUpload: {
          ...state.step5DocumentUpload,
          ...action.payload,
        } as DocumentUploadData,
      };
    case 'UPDATE_STEP6_SIGNATURE':
      return {
        ...state,
        step6Signature: {
          ...state.step6Signature,
          ...action.payload,
        } as FormDataState['step6Signature'],
      };
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'SET_APPLICATION_ID':
      return {
        ...state,
        applicationId: action.payload,
      };
    case 'SET_SIGNING_URL':
      return {
        ...state,
        signingUrl: action.payload,
      };
    case 'MARK_COMPLETE':
      return {
        ...state,
        isComplete: true,
      };
    case 'LOAD_FROM_STORAGE':
      return action.payload;
    default:
      return state;
  }
}

const FormDataContext = createContext<{
  state: FormDataState;
  dispatch: React.Dispatch<FormDataAction>;
  saveToStorage: () => void;
  loadFromStorage: () => void;
} | null>(null);

export function FormDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formDataReducer, initialState);

  const saveToStorage = () => {
    try {
      localStorage.setItem('financialFormData', JSON.stringify(state));
      console.log('Form data saved to localStorage');
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const savedData = localStorage.getItem('financialFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedData });
        console.log('Form data loaded from localStorage');
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  };

  return (
    <FormDataContext.Provider value={{ state, dispatch, saveToStorage, loadFromStorage }}>
      {children}
    </FormDataContext.Provider>
  );
}

export function useFormData() {
  const context = useContext(FormDataContext);
  if (!context) {
    throw new Error('useFormData must be used within a FormDataProvider');
  }
  return context;
}

// Export alias for useFormDataContext (used by other components)
export const useFormDataContext = useFormData;