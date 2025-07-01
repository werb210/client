export interface LenderProduct {
  // Core Identification
  id: string;
  tenantId: string;
  productName: string;
  lenderName: string;
  
  // Product Details
  productType: 'term_loan' | 'line_of_credit' | 'factoring' | 'merchant_cash_advance' | 'sba_loan' | 
              'equipment_financing' | 'invoice_factoring' | 'purchase_order_financing' | 'working_capital';
  description: string;
  videoUrl?: string;
  
  // Financial Parameters
  minAmount: number;
  maxAmount: number;
  minRevenue?: number;
  
  // Eligibility Criteria
  geography: ('US' | 'CA' | 'INTL')[];
  industries?: string[];
  isActive: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Always use staff app API for full 43+ product dataset
const STAFF_API_BASE = import.meta.env.VITE_STAFF_API_URL || 'https://staffportal.replit.app';

export async function fetchLenderProducts(): Promise<LenderProduct[]> {
  // Always use staff app public API for complete authentic dataset (43+ products)
  const url = `${STAFF_API_BASE}/api/public/lenders`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch lender products: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  const products = Array.isArray(data) ? data : data.products || [];
  
  // Normalize data format between local API (snake_case) and staff API (camelCase)
  return products.map((product: any) => {
    return {
      id: String(product.id),
      tenantId: product.tenantId || 'default',
      productName: product.productName || product.product_name || 'Unknown Product',
      lenderName: product.lenderName || product.lender_name || 'Unknown Lender',
      productType: product.productType || product.product_type || 'unknown',
      description: product.description || '',
      videoUrl: product.videoUrl || product.video_url || null,
      minAmount: Number(product.minAmount || product.min_amount || 0),
      maxAmount: Number(product.maxAmount || product.max_amount || 0),
      minRevenue: product.minRevenue || product.min_revenue || null,
      geography: Array.isArray(product.geography) ? product.geography : ['US'],
      industries: Array.isArray(product.industries) ? product.industries : [],
      isActive: product.isActive !== undefined ? product.isActive : (product.active !== undefined ? product.active : true),
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: product.updatedAt || new Date().toISOString(),
    };
  });
}

export async function fetchLenderStats() {
  const url = `${STAFF_API_BASE}/api/public/lenders/stats`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch lender statistics: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
}

export async function fetchLenderProduct(id: string): Promise<LenderProduct> {
  const url = `${STAFF_API_BASE}/api/public/lenders/${id}`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch lender product: ${res.status} ${res.statusText}`);
  }
  
  return res.json();
}