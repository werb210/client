export interface RequiredDoc {
  id: string;
  category: string;
  label: string;
  description?: string;
  allowedMimeTypes: string[];
  required: boolean;
  order: number;
}

export interface LenderProduct {
  id: string;
  name: string;
  category: string;
  minAmount: number;
  maxAmount: number;
  interestRateMin: number;
  interestRateMax: number;
  termMonths: number;
  requiredDocuments: RequiredDoc[];
}
