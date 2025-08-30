import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { offlineStorage } from '@/lib/offlineStorage';

interface ApplicationState {
  currentStep: number;
  formData: {
    businessInfo?: {
      legalName?: string;
      industry?: string;
      headquarters?: string;
      revenue?: string;
      useOfFunds?: string;
      loanAmount?: number;
    };
    selectedProduct?: string;
    productQuestions?: Record<string, any>;
    personalDetails?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    documents?: Array<{
      id: string;
      name: string;
      size: number;
      type: string;
      uploaded: boolean;
    }>;
    signature?: {
      termsAccepted?: boolean;
      signed?: boolean;
    };
  };
  isDirty: boolean;
  isOnline: boolean;
}

type ApplicationAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FORM_DATA'; payload: { section: string; data: any } }
  | { type: 'MARK_CLEAN' }
  | { type: 'MARK_DIRTY' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'LOAD_SAVED_DATA'; payload: ApplicationState };

const initialState: ApplicationState = {
  currentStep: 1,
  formData: {},
  isDirty: false,
  isOnline: navigator.onLine,
};

function applicationReducer(state: ApplicationState, action: ApplicationAction): ApplicationState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.section]: {
            ...state.formData[action.payload.section as keyof typeof state.formData],
            ...action.payload.data,
          },
        },
        isDirty: true,
      };
    case 'MARK_CLEAN':
      return { ...state, isDirty: false };
    case 'MARK_DIRTY':
      return { ...state, isDirty: true };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'LOAD_SAVED_DATA':
      return { ...action.payload, isDirty: false };
    default:
      return state;
  }
}

interface ApplicationContextType {
  state: ApplicationState;
  dispatch: React.Dispatch<ApplicationAction>;
  saveProgress: () => Promise<void>;
  loadSavedProgress: () => Promise<void>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(applicationReducer, initialState);

  // Handle online/offline status
  useEffect(() => {
    function handleOnline() {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    }

    function handleOffline() {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-save when form data changes
  useEffect(() => {
    if (state.isDirty) {
      const timer = setTimeout(() => {
        saveProgress();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [state.isDirty, state.formData]);

  const saveProgress = async () => {
    try {
      await offlineStorage.saveApplication({
        currentStep: state.currentStep,
        formData: state.formData,
        documents: [],
        lastSaved: Date.now(),
      });
      dispatch({ type: 'MARK_CLEAN' });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const loadSavedProgress = async () => {
    try {
      const savedData = await offlineStorage.getApplication();
      if (savedData) {
        dispatch({
          type: 'LOAD_SAVED_DATA',
          payload: {
            currentStep: savedData.currentStep,
            formData: savedData.formData,
            isDirty: false,
            isOnline: state.isOnline,
          },
        });
      }
    } catch (error) {
      console.error('Failed to load saved progress:', error);
    }
  };

  return (
    <ApplicationContext.Provider value={{ state, dispatch, saveProgress, loadSavedProgress }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplicationContext() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplicationContext must be used within an ApplicationProvider');
  }
  return context;
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
}
