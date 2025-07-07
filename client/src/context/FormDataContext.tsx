import { createContext, useContext, useReducer, ReactNode } from 'react';
import { ApplicationForm } from '../../../shared/schema';

// All step data interfaces now directly use the unified ApplicationForm
export interface FinancialProfileData extends Partial<ApplicationForm> {
  selectedCategory?: string;
  selectedCategoryName?: string;
  completed?: boolean;
}

export interface BusinessDetailsData extends Partial<ApplicationForm> {
  completed?: boolean;
}

export interface FinancialInfoData extends Partial<ApplicationForm> {
  completed?: boolean;
}

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
}

export interface FormDataState extends Partial<ApplicationForm> {
  // Step-specific completion tracking
  step1Completed?: boolean;
  step2Completed?: boolean;
  step3Completed?: boolean;
  step4Completed?: boolean;
  step5Completed?: boolean;
  step6Completed?: boolean;
  
  // Document upload data
  step5DocumentUpload?: DocumentUploadData;
  
  // Signature data
  step6Signature?: {
    signedAt?: string;
    documentId?: string;
    signingUrl?: string;
    completed?: boolean;
    applicationId?: string;
  };
  
  // Application flow state
  currentStep: number;
  isComplete: boolean;
  applicationId?: string;
  signingUrl?: string;
}

type FormDataAction =
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<ApplicationForm> }
  | { type: 'UPDATE_STEP1'; payload: Partial<ApplicationForm> }
  | { type: 'UPDATE_STEP2'; payload: Partial<ApplicationForm> }
  | { type: 'UPDATE_STEP3'; payload: Partial<ApplicationForm> }
  | { type: 'UPDATE_STEP4'; payload: Partial<ApplicationForm> }
  | { type: 'UPDATE_STEP5'; payload: Partial<DocumentUploadData> }
  | { type: 'UPDATE_STEP6'; payload: Partial<FormDataState['step6Signature']> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_APPLICATION_ID'; payload: string }
  | { type: 'SET_SIGNING_URL'; payload: string }
  | { type: 'MARK_STEP_COMPLETE'; payload: number }
  | { type: 'MARK_COMPLETE' }
  | { type: 'LOAD_FROM_STORAGE'; payload: FormDataState };

const initialState: FormDataState = {
  // Application flow state
  currentStep: 1,
  isComplete: false,
  applicationId: '',
  signingUrl: '',
  
  // Step completion tracking
  step1Completed: false,
  step2Completed: false,
  step3Completed: false,
  step4Completed: false,
  step5Completed: false,
  step6Completed: false,
  
  // Document upload data
  step5DocumentUpload: {
    uploadedFiles: []
  },
  
  // Signature data
  step6Signature: {}
};

function formDataReducer(state: FormDataState, action: FormDataAction): FormDataState {
  switch (action.type) {
    case 'UPDATE_FORM_DATA':
    case 'UPDATE_STEP1':
    case 'UPDATE_STEP2':
    case 'UPDATE_STEP3':
    case 'UPDATE_STEP4':
      return {
        ...state,
        ...action.payload,
      };
    case 'UPDATE_STEP5':
      return {
        ...state,
        step5DocumentUpload: {
          ...state.step5DocumentUpload,
          ...action.payload,
        } as DocumentUploadData,
      };
    case 'UPDATE_STEP6':
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
    case 'MARK_STEP_COMPLETE':
      const stepKey = `step${action.payload}Completed` as keyof FormDataState;
      return {
        ...state,
        [stepKey]: true,
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