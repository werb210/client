export interface ApplicationData {
  kyc: any;
  productCategory: string | null;
  business: any;
  applicant: any;
  documents: Record<string, any>;
  termsAccepted: boolean;
}
