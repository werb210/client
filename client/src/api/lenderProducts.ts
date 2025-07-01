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

export async function fetchLenderProducts(): Promise<LenderProduct[]> {
  const res = await fetch("/api/local/lenders");
  if (!res.ok) throw new Error("Failed to fetch lender products");
  const data = await res.json();
  return data.products;
}

export async function fetchLenderStats() {
  const res = await fetch("/api/local/lenders/stats");
  if (!res.ok) throw new Error("Failed to fetch lender statistics");
  return res.json();
}

export async function fetchLenderProduct(id: string): Promise<LenderProduct> {
  const res = await fetch(`/api/local/lenders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch lender product");
  return res.json();
}