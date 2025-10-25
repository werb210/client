import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ApplicationForm, ApplicationFormUpdate, UploadedDocument } from '@/types/application';

const FORM_DATA_STORAGE_KEY = 'bf:form-data';
const INTAKE_STORAGE_KEY = 'bf:intake:v2';

export type Intake = {
  country?: 'US' | 'CA' | string;
  amountRequested?: number;
  industry?: string;
  yearsInBusiness?: number;
  revenue12m?: number;
  avgMonthlyRevenue?: number;
  purpose?: string;
  arBalance?: number;
  collateralValue?: number;
};

type FormDataContextValue = {
  data: ApplicationForm;
  formData: ApplicationForm;
  save: (update: ApplicationFormUpdate) => void;
  clear: () => void;
  isComplete: boolean;
};

const FormDataContext = createContext<FormDataContextValue | undefined>(undefined);

const emptyForm: ApplicationForm = {};

const jsonReplacer = (_: string, value: unknown) => {
  if (value === undefined) {
    return null;
  }

  if (typeof File !== 'undefined' && value instanceof File) {
    return {
      name: value.name,
      size: value.size,
      type: value.type,
    };
  }

  return value;
};

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const numeric = Number(String(value).replace(/[$,\s]/g, ''));
  return Number.isFinite(numeric) ? numeric : undefined;
};

const readSafely = <T,>(key: string): T | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const storages: (Storage | null | undefined)[] = [window.localStorage, window.sessionStorage];

  for (const storage of storages) {
    if (!storage) {
      continue;
    }

    try {
      const raw = storage.getItem(key);
      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw) as T;
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (error) {
      console.warn(`[FormDataContext] Failed to read persisted value for ${key}`, error);
    }
  }

  return undefined;
};

const persistSafely = (key: string, value: unknown) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const serialized = JSON.stringify(value, jsonReplacer);
    window.localStorage?.setItem(key, serialized);
    window.sessionStorage?.setItem(key, serialized);
  } catch (error) {
    console.warn(`[FormDataContext] Failed to persist ${key}`, error);
  }
};

const removeSafely = (key: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage?.removeItem(key);
    window.sessionStorage?.removeItem(key);
  } catch (error) {
    console.warn(`[FormDataContext] Failed to clear ${key}`, error);
  }
};

const extractDocuments = (form: ApplicationForm): UploadedDocument[] => {
  if (Array.isArray(form.uploadedFiles)) {
    return form.uploadedFiles;
  }

  const fromStep = (form.step5DocumentUpload?.uploadedFiles ?? form.step5DocumentUpload?.files);
  return Array.isArray(fromStep) ? fromStep : [];
};

export function normalizeIntake(raw: Partial<ApplicationForm>): Intake {
  const safeRaw = raw ?? {};

  return {
    country: (safeRaw.country as Intake['country']) ?? (safeRaw.businessLocation as Intake['country']),
    amountRequested: toNumber(safeRaw.amountRequested ?? safeRaw.fundingAmount),
    industry: typeof safeRaw.industry === 'string' ? safeRaw.industry : undefined,
    yearsInBusiness: toNumber((safeRaw as Record<string, unknown>).yearsInBusiness),
    revenue12m: toNumber((safeRaw as Record<string, unknown>).revenueLastYear ?? (safeRaw as Record<string, unknown>).last12moRevenue),
    avgMonthlyRevenue: toNumber((safeRaw as Record<string, unknown>).avgMonthlyRevenue),
    purpose: typeof safeRaw.fundsPurpose === 'string' ? safeRaw.fundsPurpose : undefined,
    arBalance: toNumber((safeRaw as Record<string, unknown>).accountsReceivableBalance),
    collateralValue: toNumber((safeRaw as Record<string, unknown>).fixedAssetsValue),
  };
}

export function onStep1Submit(raw: Partial<ApplicationForm>, navigateToStep2: () => void) {
  const intake = normalizeIntake(raw);
  persistSafely(INTAKE_STORAGE_KEY, intake);

  navigateToStep2();
}

export function FormDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ApplicationForm>(() => {
    const stored = readSafely<ApplicationForm>(FORM_DATA_STORAGE_KEY);
    return stored ?? emptyForm;
  });

  const save = useCallback((update: ApplicationFormUpdate) => {
    setData((previous) => {
      const next = { ...previous, ...update };
      persistSafely(FORM_DATA_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setData(emptyForm);
    removeSafely(FORM_DATA_STORAGE_KEY);
    removeSafely(INTAKE_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = readSafely<ApplicationForm>(FORM_DATA_STORAGE_KEY);
    if (stored) {
      setData((current) => (Object.keys(current).length === 0 ? stored : current));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== FORM_DATA_STORAGE_KEY) {
        return;
      }

      if (event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as ApplicationForm;
          if (parsed && typeof parsed === 'object') {
            setData(parsed);
          }
        } catch (error) {
          console.warn('[FormDataContext] Failed to parse storage event payload', error);
        }
      } else {
        setData(emptyForm);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo<FormDataContextValue>(() => {
    const completedSteps = Array.isArray(data.completedSteps)
      ? data.completedSteps
      : extractDocuments(data).length
        ? ['Financial Profile', 'Product Recommendations', 'Business Details', 'Applicant Information', 'Document Upload']
        : [];

    return {
      data,
      formData: data,
      save,
      clear,
      isComplete: Boolean(data.applicationId && completedSteps.length >= 4),
    };
  }, [data, save, clear]);

  return <FormDataContext.Provider value={value}>{children}</FormDataContext.Provider>;
}

export function useFormData(): FormDataContextValue {
  const context = useContext(FormDataContext);

  if (!context) {
    throw new Error('useFormData must be used within a FormDataProvider');
  }

  return context;
}

// Legacy compatibility export
export const useFormDataContext = useFormData;
