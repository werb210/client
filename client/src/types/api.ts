/**
 * Generated API types for Staff Portal
 * Fallback types based on known API structure
 */

export interface paths {
  '/api/signnow/generate': {
    post: {
      requestBody: {
        content: {
          'application/json': {
            applicationId: string;
            formFields: {
              businessName: string;
              ownerName: string;
              requestedAmount: number;
              [key: string]: any;
            };
          };
        };
      };
      responses: {
        200: {
          content: {
            'application/json': {
              success: boolean;
              signUrl: string;
              documentId: string;
            };
          };
        };
      };
    };
  };
  
  '/api/public/lenders': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': {
              success: boolean;
              products: Array<{
                id: string;
                lender: string;
                product: string;
                productCategory: string;
                minAmountUsd: number;
                maxAmountUsd: number;
                interestRateMin?: number;
                interestRateMax?: number;
                termMinMonths?: number;
                termMaxMonths?: number;
                rateType?: 'fixed' | 'variable';
                interestFrequency?: 'monthly' | 'quarterly' | 'annually';
                requiredDocs: string[];
                minRevenue?: number;
                industries?: string[];
                description?: string;
                geography?: string[];
                isActive?: boolean;
                createdAt: string;
                updatedAt: string;
              }>;
              count: number;
              total: number;
            };
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    LenderProduct: {
      id: string;
      lender: string;
      product: string;
      productCategory: string;
      minAmountUsd: number;
      maxAmountUsd: number;
      interestRateMin?: number;
      interestRateMax?: number;
      termMinMonths?: number;
      termMaxMonths?: number;
      rateType?: 'fixed' | 'variable';
      interestFrequency?: 'monthly' | 'quarterly' | 'annually';
      requiredDocs: string[];
      minRevenue?: number;
      industries?: string[];
      description?: string;
      geography?: string[];
      isActive?: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}