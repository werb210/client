export type LenderProduct = {
  id: string;
  name: string;
  lender_name?: string;
  country?: string;         // "US" | "CA"
  category?: string;
  min_amount?: number | null;
  max_amount?: number | null;
  active?: boolean | null;
};

export function categoriesFor(
  products: LenderProduct[],
  amount?: number,
  country?: string
): string[] {
  const present = (v: any) => v !== undefined && v !== null && v !== '';
  const hasFilters = present(amount) && present(country);

  const rows = hasFilters
    ? products.filter(p => {
        const cc = (p.country || '').toUpperCase();
        const min = Number(p.min_amount ?? 0);
        const max = p.max_amount == null ? Infinity : Number(p.max_amount);
        return cc === String(country).toUpperCase() && min <= (amount as number) && (amount as number) <= max;
      })
    : products;

  const cats = new Set(
    rows.map(p => p.category).filter((c): c is string => Boolean(c && String(c).trim()))
  );
  return Array.from(cats).sort();
}