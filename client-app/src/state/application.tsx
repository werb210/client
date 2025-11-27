import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type FundingProductCategory =
  | "loc"
  | "term_loan"
  | "factoring"
  | "equipment"
  | "micro_loan";

export interface KycInfo {
  fundingAmount: number | null;
  fundingTimeline: string;
  purpose: string;
  hasExistingLoans: "yes" | "no" | "";
}

export interface BusinessInfo {
  legalName: string;
  operatingName: string;
  industry: string;
  yearsInBusiness: string;
  annualRevenue: string;
  businessNumber: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface ApplicantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  ownershipPercent: string;
  homeAddressLine1: string;
  homeAddressLine2: string;
  homeCity: string;
  homeProvince: string;
  homePostalCode: string;
  sin: string;
}

export interface DocumentInfo {
  bankStatementsSelected: boolean;
  financialStatementsSelected: boolean;
  taxReturnsSelected: boolean;
  idsSelected: boolean;
}

export interface SignatureInfo {
  fullName: string;
  acceptedTerms: boolean;
}

export interface ApplicationData {
  kyc: KycInfo;
  productCategory: FundingProductCategory | null;
  business: BusinessInfo;
  applicant: ApplicantInfo;
  documents: DocumentInfo;
  signature: SignatureInfo;
}

export interface ApplicationContextValue {
  data: ApplicationData;
  update: (patch: Partial<ApplicationData>) => void;
  reset: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

const defaultApplicationData: ApplicationData = {
  kyc: {
    fundingAmount: null,
    fundingTimeline: "",
    purpose: "",
    hasExistingLoans: "",
  },
  productCategory: null,
  business: {
    legalName: "",
    operatingName: "",
    industry: "",
    yearsInBusiness: "",
    annualRevenue: "",
    businessNumber: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
  },
  applicant: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    ownershipPercent: "",
    homeAddressLine1: "",
    homeAddressLine2: "",
    homeCity: "",
    homeProvince: "",
    homePostalCode: "",
    sin: "",
  },
  documents: {
    bankStatementsSelected: false,
    financialStatementsSelected: false,
    taxReturnsSelected: false,
    idsSelected: false,
  },
  signature: {
    fullName: "",
    acceptedTerms: false,
  },
};

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ApplicationData>(defaultApplicationData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const value = useMemo<ApplicationContextValue>(
    () => ({
      data,
      update: (patch) =>
        setData((prev) => ({
          ...prev,
          ...patch,
        })),
      reset: () => setData(defaultApplicationData),
      isSubmitting,
      setIsSubmitting,
    }),
    [data, isSubmitting]
  );

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const ctx = useContext(ApplicationContext);
  if (!ctx) {
    throw new Error("useApplication must be used within ApplicationProvider");
  }
  return ctx;
};
