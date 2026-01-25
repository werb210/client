import type { ClientLenderProduct } from "../api/lenders";

export type ActiveProduct = ClientLenderProduct & { status?: string };

export function filterActiveProducts(products: ActiveProduct[]) {
  return products.filter(
    (product) => (product.status || "").toLowerCase() === "active"
  );
}

export function parseCurrencyAmount(value?: string | number | null) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = value.toString().replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function isAmountWithinRange(
  amount: number,
  minAmount?: number | null,
  maxAmount?: number | null
) {
  if (Number.isNaN(amount) || amount <= 0) return false;
  if (typeof minAmount === "number" && amount < minAmount) return false;
  if (typeof maxAmount === "number" && amount > maxAmount) return false;
  return true;
}
