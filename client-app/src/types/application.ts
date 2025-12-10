export interface ApplicationData {
  kyc: any;
  productCategory: string | null;
  business: any;
  applicant: any;
  documents: Record<string, { name: string; base64?: string; uploaded?: boolean }>;
  termsAccepted: boolean;
  applicationToken?: string;
}
