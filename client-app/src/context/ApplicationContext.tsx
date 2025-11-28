import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type ProductCategory =
  | "loc"
  | "term_loan"
  | "factoring"
  | "equipment_finance"
  | "start_up_loan";

export interface KycData {
  businessType: string;
  timeInBusiness: number | null; // in months
  monthlyRevenue: number | null;
  annualRevenue: number | null;
  industry: string;
}

export interface BusinessDetails {
  useOfFunds: string;
  numberOfEmployees: number | null;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  purchasingEquipment: boolean;
  issuesInvoices: boolean;
}

export interface ApplicantDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface DocumentsData {
  hasUploadedBankStatements: boolean;
  hasUploadedFinancialStatements: boolean;
}

export interface SignatureData {
  fullName: string;
  acceptedTerms: boolean;
}

export interface ApplicationData {
  kyc: KycData;
  selectedProductCategory: ProductCategory | null;
  businessDetails: BusinessDetails;
  applicantDetails: ApplicantDetails;
  documents: DocumentsData;
  signature: SignatureData;
}

export interface ApplicationContextValue {
  applicationData: ApplicationData;
  updateKyc: (kyc: Partial<KycData>) => void;
  updateBusinessDetails: (details: Partial<BusinessDetails>) => void;
  setSelectedProductCategory: (category: ProductCategory | null) => void;
  updateApplicantDetails: (details: Partial<ApplicantDetails>) => void;
  updateDocuments: (details: Partial<DocumentsData>) => void;
  updateSignature: (details: Partial<SignatureData>) => void;
  reset: () => void;
}

const defaultApplicationData: ApplicationData = {
  kyc: {
    businessType: "",
    timeInBusiness: null,
    monthlyRevenue: null,
    annualRevenue: null,
    industry: "",
  },
  selectedProductCategory: null,
  businessDetails: {
    useOfFunds: "",
    numberOfEmployees: null,
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    purchasingEquipment: false,
    issuesInvoices: false,
  },
  applicantDetails: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  documents: {
    hasUploadedBankStatements: false,
    hasUploadedFinancialStatements: false,
  },
  signature: {
    fullName: "",
    acceptedTerms: false,
  },
};

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
  const [applicationData, setApplicationData] =
    useState<ApplicationData>(defaultApplicationData);

  const updateKyc = (kyc: Partial<KycData>) => {
    setApplicationData((prev) => ({
      ...prev,
      kyc: { ...prev.kyc, ...kyc },
    }));
  };

  const updateBusinessDetails = (details: Partial<BusinessDetails>) => {
    setApplicationData((prev) => ({
      ...prev,
      businessDetails: { ...prev.businessDetails, ...details },
    }));
  };

  const setSelectedProductCategory = (category: ProductCategory | null) => {
    setApplicationData((prev) => ({
      ...prev,
      selectedProductCategory: category,
    }));
  };

  const updateApplicantDetails = (details: Partial<ApplicantDetails>) => {
    setApplicationData((prev) => ({
      ...prev,
      applicantDetails: { ...prev.applicantDetails, ...details },
    }));
  };

  const updateDocuments = (details: Partial<DocumentsData>) => {
    setApplicationData((prev) => ({
      ...prev,
      documents: { ...prev.documents, ...details },
    }));
  };

  const updateSignature = (details: Partial<SignatureData>) => {
    setApplicationData((prev) => ({
      ...prev,
      signature: { ...prev.signature, ...details },
    }));
  };

  const reset = () => setApplicationData(defaultApplicationData);

  const value = useMemo(
    () => ({
      applicationData,
      updateKyc,
      updateBusinessDetails,
      setSelectedProductCategory,
      updateApplicantDetails,
      updateDocuments,
      updateSignature,
      reset,
    }),
    [applicationData]
  );

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = (): ApplicationContextValue => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplication must be used within ApplicationProvider");
  }
  return context;
};
