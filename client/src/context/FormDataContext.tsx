import { createContext, useContext, useReducer, ReactNode } from 'react';

export interface FinancialProfileData {
  businessLocation: string;
  monthlyRevenue: string;
  industry: string;
  businessAge: string;
  useOfFunds: string;
  selectedCategory?: string;
  selectedCategoryName?: string;
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

export interface FormDataState {
  step1FinancialProfile: FinancialProfileData;
  step3BusinessDetails?: BusinessDetailsData;
  currentStep: number;
  isComplete: boolean;
}

type FormDataAction =
  | { type: 'UPDATE_STEP1'; payload: Partial<FinancialProfileData> }
  | { type: 'UPDATE_STEP3'; payload: Partial<BusinessDetailsData> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_COMPLETE' }
  | { type: 'LOAD_FROM_STORAGE'; payload: FormDataState };

const initialState: FormDataState = {
  step1FinancialProfile: {
    businessLocation: '',
    monthlyRevenue: '',
    industry: '',
    businessAge: '',
    useOfFunds: '',
    selectedCategory: '',
    selectedCategoryName: '',
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
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
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