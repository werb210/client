import { createContext, useContext, useReducer, ReactNode } from 'react';
import { ApplicationForm } from '@/types/forms';

interface ComprehensiveFormState {
  currentStep: number;
  formData: Partial<ApplicationForm>;
  completedSteps: Set<number>;
  isSubmitting: boolean;
  applicationId?: string;
}

type ComprehensiveFormAction =
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<ApplicationForm> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETE'; payload: number }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_APPLICATION_ID'; payload: string }
  | { type: 'RESET_FORM' };

const initialState: ComprehensiveFormState = {
  currentStep: 1,
  formData: {},
  completedSteps: new Set(),
  isSubmitting: false,
};

function comprehensiveFormReducer(
  state: ComprehensiveFormState,
  action: ComprehensiveFormAction
): ComprehensiveFormState {
  switch (action.type) {
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'MARK_STEP_COMPLETE':
      return {
        ...state,
        completedSteps: new Set(Array.from(state.completedSteps).concat(action.payload)),
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };
    case 'SET_APPLICATION_ID':
      return {
        ...state,
        applicationId: action.payload,
      };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}

interface ComprehensiveFormContextValue {
  state: ComprehensiveFormState;
  updateFormData: (data: Partial<ApplicationForm>) => void;
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  setSubmitting: (submitting: boolean) => void;
  setApplicationId: (id: string) => void;
  resetForm: () => void;
  isStepComplete: (step: number) => boolean;
  canNavigateToStep: (step: number) => boolean;
}

const ComprehensiveFormContext = createContext<ComprehensiveFormContextValue | undefined>(undefined);

export function ComprehensiveFormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(comprehensiveFormReducer, initialState);

  const updateFormData = (data: Partial<ApplicationForm>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: data });
  };

  const setCurrentStep = (step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const markStepComplete = (step: number) => {
    dispatch({ type: 'MARK_STEP_COMPLETE', payload: step });
  };

  const setSubmitting = (submitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', payload: submitting });
  };

  const setApplicationId = (id: string) => {
    dispatch({ type: 'SET_APPLICATION_ID', payload: id });
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  const isStepComplete = (step: number) => {
    return state.completedSteps.has(step);
  };

  const canNavigateToStep = (step: number) => {
    // Can navigate to current step, previous completed steps, or next step if current is complete
    if (step === state.currentStep) return true;
    if (step < state.currentStep) return true;
    if (step === state.currentStep + 1 && isStepComplete(state.currentStep)) return true;
    return false;
  };

  const value: ComprehensiveFormContextValue = {
    state,
    updateFormData,
    setCurrentStep,
    markStepComplete,
    setSubmitting,
    setApplicationId,
    resetForm,
    isStepComplete,
    canNavigateToStep,
  };

  return (
    <ComprehensiveFormContext.Provider value={value}>
      {children}
    </ComprehensiveFormContext.Provider>
  );
}

export function useComprehensiveForm() {
  const context = useContext(ComprehensiveFormContext);
  if (context === undefined) {
    throw new Error('useComprehensiveForm must be used within a ComprehensiveFormProvider');
  }
  return context;
}