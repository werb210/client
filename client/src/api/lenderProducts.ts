interface LenderProduct {
  id: string;
  product_name: string;
  lender_name: string;
  product_type: string;
  geography: string[];
  min_amount: number;
  max_amount: number;
  min_revenue?: number;
  industries?: string[];
  video_url?: string;
  description?: string;
  interest_rate_min?: number;
  interest_rate_max?: number;
  term_min?: number;
  term_max?: number;
  requirements?: string[];
  active: boolean;
}

// Environment-based API URL configuration
const getApiBaseUrl = () => {
  // In development, use local endpoints
  if (import.meta.env.DEV) {
    return '';
  }
  // In production, use staff app public API
  return import.meta.env.VITE_STAFF_API_URL || 'https://staffportal.replit.app';
};

const API_BASE = getApiBaseUrl();

export async function fetchLenderProducts(): Promise<LenderProduct[]> {
  const url = API_BASE ? `${API_BASE}/api/public/lenders` : '/api/local/lenders';
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch lender products");
  const data = await res.json();
  return data.products || data; // Handle both response formats
}

export async function fetchLenderStats() {
  const url = API_BASE ? `${API_BASE}/api/public/lenders/stats` : '/api/local/lenders/stats';
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch lender statistics");
  return res.json();
}

export async function fetchLenderProduct(id: string): Promise<LenderProduct> {
  const url = API_BASE ? `${API_BASE}/api/public/lenders/${id}` : `/api/local/lenders/${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch lender product");
  return res.json();
}