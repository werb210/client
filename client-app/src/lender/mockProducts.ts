export interface LenderProduct {
  id: string;
  businessQuestions: string[];
  applicantQuestions: string[];
  requiredDocs: string[];
}

export const mockProducts: LenderProduct[] = [];
