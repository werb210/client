export interface LenderProduct {
  id: string;
  name: string;
  required_documents?: string[];
  [key: string]: unknown;
}
