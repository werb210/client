import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { ApplicationForm } from '../types/applicationForm';

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
  // New: Track files with their categories during Step 5
  files?: Array<{
    file: File;
    type: string;
    category: string;
  }>;
  completed?: boolean;
}

export interface FormDataState extends Partial<ApplicationForm> {
  // Step-based data structure for validation
  step1?: Partial<ApplicationForm>;
  step3?: Partial<ApplicationForm>;
  step4?: Partial<ApplicationForm>;
  
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
  | { type: 'SET_APPLICATION_ID'; payload: string }
  | { type: 'ADD_FILE'; payload: { file: File; type: string; category: string } }
  | { type: 'REMOVE_FILE'; payload: string }
  | { type: 'CLEAR_FILES' }
  | { type: 'UPDATE_STEP6'; payload: Partial<FormDataState['step6Signature']> }
  | { type: 'UPDATE_STEP6_SIGNATURE'; payload: Partial<FormDataState['step6Signature']> }
  | { type: 'UPDATE_STEP6_AUTHORIZATION'; payload: any }
  | { type: 'UPDATE_STEP4_SUBMISSION'; payload: Partial<ApplicationForm> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_APPLICATION_ID'; payload: string }
  | { type: 'SET_SIGNING_URL'; payload: string }
  | { type: 'MARK_STEP_COMPLETE'; payload: number }
  | { type: 'MARK_COMPLETE' }
  | { type: 'LOAD_FROM_STORAGE'; payload: FormDataState };

const initialState: FormDataState = {
  // Step-based data structure
  step1: {},
  step3: {},
  step4: {},
  
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
  step6Signature: {},
  
  // Authorization data for typed signature
  step6Authorization: {}
};

function formDataReducer(state: FormDataState, action: FormDataAction): FormDataState {
  switch (action.type) {
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        ...action.payload,
      };
    case 'UPDATE_STEP1':
      return {
        ...state,
        step1: {
          ...state.step1,
          ...action.payload,
        },
        ...action.payload, // Also store at root level for backward compatibility
      };
    case 'UPDATE_STEP2':
      return {
        ...state,
        ...action.payload,
      };
    case 'UPDATE_STEP3':
      return {
        ...state,
        step3: {
          ...state.step3,
          ...action.payload,
        },
        ...action.payload, // Also store at root level for backward compatibility
      };
    case 'UPDATE_STEP4':
      return {
        ...state,
        step4: {
          ...state.step4,
          ...action.payload,
        },
        ...action.payload, // Also store at root level for backward compatibility
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
    case 'UPDATE_STEP6_SIGNATURE':
      return {
        ...state,
        step6Signature: {
          ...state.step6Signature,
          ...action.payload,
        } as FormDataState['step6Signature'],
      };
    case 'UPDATE_STEP6_AUTHORIZATION':
      return {
        ...state,
        step6Authorization: action.payload,
        step6Completed: true,
      };
    case 'UPDATE_STEP4_SUBMISSION':
      return {
        ...state,
        ...action.payload,
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
    case 'ADD_FILE':
      return {
        ...state,
        step5DocumentUpload: {
          ...state.step5DocumentUpload,
          files: [
            ...(state.step5DocumentUpload?.files || []),
            action.payload,
          ],
        },
      };
    case 'REMOVE_FILE':
      return {
        ...state,
        step5DocumentUpload: {
          ...state.step5DocumentUpload,
          files: state.step5DocumentUpload?.files?.filter(f => f.file.name !== action.payload) || [],
        },
      };
    case 'CLEAR_FILES':
      return {
        ...state,
        step5DocumentUpload: {
          ...state.step5DocumentUpload,
          files: [],
        },
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

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage();
  }, [state]);

  const saveToStorage = () => {
    try {
      localStorage.setItem('formData', JSON.stringify(state));
      // Also save with legacy key for compatibility
      localStorage.setItem('financialFormData', JSON.stringify(state));
      // console.log('Form data saved to localStorage');
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      // Try primary key first, then fallback to legacy key
      const savedData = localStorage.getItem('formData') || localStorage.getItem('financialFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedData });
        // console.log('Form data loaded from localStorage');
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