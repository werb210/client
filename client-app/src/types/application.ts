export interface ApplicationData {
  kyc: any;
  productCategory: string | null;
  matchPercentages: Record<string, number>;
  business: any;
  applicant: any;
  documents: Record<string, { name: string; base64?: string; uploaded?: boolean }>;
  documentsDeferred?: boolean;
  termsAccepted: boolean;
  typedSignature?: string;
  signatureDate?: string;
  applicationToken?: string;
  applicationId?: string;
  currentStep?: number;
}
