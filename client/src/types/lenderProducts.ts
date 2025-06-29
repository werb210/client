export interface LenderProduct {
  id: string;
  product_name: string;
  lender_name: string;
  product_type:
    | 'equipment_financing'
    | 'invoice_factoring'
    | 'line_of_credit'
    | 'working_capital'
    | 'term_loan'
    | 'purchase_order_financing';
  geography: string[];
  min_amount: number;
  max_amount: number;
  min_revenue?: number;
  industries?: string[];
  video_url?: string;
  description?: string;
}

export interface LenderProductsResponse {
  products: LenderProduct[];
}