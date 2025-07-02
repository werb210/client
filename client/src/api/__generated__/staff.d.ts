/**
 * OpenAPI schema types for Staff API V2
 * Generated from staff portal expanded lender product schema
 */

export interface components {
  schemas: {
    LenderProduct: {
      id: string;
      lender: string;                    // was: lenderName
      product: string;                   // was: productName  
      productCategory: string;           // was: category
      minAmountUsd: number;             // was: minAmount
      maxAmountUsd: number;             // was: maxAmount
      
      // NEW EXPANDED FIELDS
      interestRateMin?: number;
      interestRateMax?: number;
      termMinMonths?: number;
      termMaxMonths?: number;
      rateType?: 'fixed' | 'variable';
      interestFrequency?: 'monthly' | 'quarterly' | 'annually';
      requiredDocs: string[];
      
      // OPTIONAL EXISTING FIELDS
      minRevenue?: number;
      industries?: string[];
      description?: string;
      geography?: string[];
      isActive?: boolean;
      
      // METADATA
      createdAt: string;
      updatedAt: string;
    };
    
    LenderProductsResponse: {
      success: boolean;
      products: components['schemas']['LenderProduct'][];
      count: number;
      total: number;
      page?: number;
      limit?: number;
    };
    
    LenderProductFilters: {
      productCategory?: string;
      minAmount?: number;
      maxAmount?: number;
      geography?: string;
      isActive?: boolean;
    };
  };
}

export interface paths {
  '/api/public/lenders': {
    get: {
      parameters: {
        query?: components['schemas']['LenderProductFilters'];
      };
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['LenderProductsResponse'];
          };
        };
      };
    };
  };
}

// Convenience type exports
export type LenderProduct = components['schemas']['LenderProduct'];
export type LenderProductsResponse = components['schemas']['LenderProductsResponse'];
export type LenderProductFilters = components['schemas']['LenderProductFilters'];