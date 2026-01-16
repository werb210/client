export interface ApplicationData {
  kyc: any;
  productCategory: string | null;
  matchPercentages: Record<string, number>;
  business: any;
  applicant: any;
  documents: Record<string, { name: string; base64?: string; uploaded?: boolean }>;
  termsAccepted: boolean;
  applicationToken?: string;
}
