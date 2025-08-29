export type ProductRaw = any;

export type Category =
  | 'working_capital' | 'equipment_financing' | 'invoice_factoring'
  | 'line_of_credit'  | 'term_loan'           | 'purchase_order_financing'
  | 'asset_based_lending' | 'sba_loan';

export type Product = {
  id: string;
  lenderId?: string;
  name?: string;
  country: 'US' | 'CA' | string;
  minAmount: number;
  maxAmount: number;
  category: Category;
  active: boolean;
};

export function normalizeProduct(p: ProductRaw): Product {
  // Map snake_case from Staff → camelCase your rules expect
  const country = p.country ?? p.country_offered ?? p.geo ?? 'US';
  const minAmount = p.minAmount ?? p.amount_min ?? p.min_amount ?? 0;
  const maxAmount = p.maxAmount ?? p.amount_max ?? p.max_amount ?? 0;
  const category: Category = (p.category ?? p.type ?? 'working_capital') as Category;
  return {
    id: String(p.id),
    lenderId: p.lender_id ?? p.lenderId,
    name: p.name,
    country,
    minAmount: Number(minAmount),
    maxAmount: Number(maxAmount),
    category,
    active: Boolean(p.active ?? true),
  };
}

export function normalizeProducts(list: ProductRaw[]): Product[] {
  return (Array.isArray(list) ? list : []).map(normalizeProduct).filter(p => p.active);
}