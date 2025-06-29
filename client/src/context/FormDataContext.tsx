import { createContext, useContext, useReducer, ReactNode } from 'react';

export interface FinancialProfileData {
  fundingAmount?: string;
  useOfFunds?: string;
  businessLocation?: string;
  industry?: string;
  lookingFor?: string;
  salesHistory?: string;
  lastYearRevenue?: string;
  monthlyRevenue?: string;
  accountReceivable?: string;
  fixedAssets?: string;
  selectedCategory?: string;
  averageMonthlyRevenue?: string;
  accountsReceivable?: string;
  equipmentValue?: string;
}

export interface BusinessDetailsData {
  businessStructure: string;
  incorporationDate: string;
  businessAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  taxId: string;
}

export interface FinancialInfoData {
  annualRevenue: string;
  monthlyExpenses: string;
  numberOfEmployees: string;
  totalAssets: string;
  totalLiabilities: string;
}

export interface DocumentUploadData {
  categories: Array<{
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
  completedAt?: string;
  savedAt?: string;
}

export interface FormDataState {
  step1FinancialProfile: FinancialProfileData;
  step3BusinessDetails?: BusinessDetailsData;
  step4FinancialInfo?: FinancialInfoData;
  step5DocumentUpload?: DocumentUploadData;
  currentStep: number;
  isComplete: boolean;
  applicationId?: string;
}

type FormDataAction =
  | { type: 'UPDATE_STEP1'; payload: Partial<FinancialProfileData> }
  | { type: 'UPDATE_STEP3'; payload: Partial<BusinessDetailsData> }
  | { type: 'UPDATE_STEP4'; payload: Partial<FinancialInfoData> }
  | { type: 'UPDATE_STEP5'; payload: Partial<DocumentUploadData> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_APPLICATION_ID'; payload: string }
  | { type: 'MARK_COMPLETE' }
  | { type: 'LOAD_FROM_STORAGE'; payload: FormDataState };

const initialState: FormDataState = {
  step1FinancialProfile: {
    fundingAmount: '',
    useOfFunds: '',
    businessLocation: '',
    industry: '',
    lookingFor: '',
    salesHistory: '',
    lastYearRevenue: '',
    monthlyRevenue: '',
    accountReceivable: '',
    fixedAssets: '',
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
    case 'UPDATE_STEP5':
      return {
        ...state,
        step5DocumentUpload: {
          ...state.step5DocumentUpload,
          ...action.payload,
        } as DocumentUploadData,
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